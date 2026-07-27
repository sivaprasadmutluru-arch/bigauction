package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.request.BidRequest;
import com.bigauction.big_auction.dto.response.BidResponse;
import com.bigauction.big_auction.dto.response.MyBidResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.AutoBidConfig;
import com.bigauction.big_auction.entity.Bid;
import com.bigauction.big_auction.entity.User;
import com.bigauction.big_auction.enums.AuctionStatus;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.AutoBidConfigRepository;
import com.bigauction.big_auction.repository.BidRepository;
import com.bigauction.big_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final AuctionService auctionService;
    private final TicketService ticketService;
    private final BroadcastService broadcastService;
    private final AutoBidConfigRepository autoBidConfigRepository;

    @Transactional
    public BidResponse placeBid(Long auctionId, Long userId, BidRequest request) {
        Auction auction = auctionService.findById(auctionId);
        String currency = auction.getCurrency();

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Auction is not active");
        }
        if (!ticketService.hasTicket(auctionId, userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must purchase a ticket before bidding");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Offer amount must be greater than zero");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal userTotalBefore = getUserTotalBid(auctionId, userId);
        BigDecimal userTotalAfter = userTotalBefore.add(request.getAmount());

        if (auction.getMaxBidAmount() != null
                && userTotalAfter.compareTo(auction.getMaxBidAmount()) > 0) {
            BigDecimal remaining = auction.getMaxBidAmount().subtract(userTotalBefore).max(BigDecimal.ZERO);
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Offer exceeds your remaining limit of " + currency + " " + remaining.toPlainString());
        }

        // Capture previous highest bidder before overwriting — needed for outbid notification
        User previousHighestBidder = auction.getHighestBidder();
        boolean becomesHighest = userTotalAfter.compareTo(auction.getCurrentHighestBid()) > 0
                || previousHighestBidder == null
                || previousHighestBidder.getId().equals(userId);

        Bid bid = Bid.builder()
                .auction(auction)
                .user(user)
                .amount(request.getAmount())
                .build();
        bidRepository.save(bid);

        if (becomesHighest) {
            auction.setCurrentHighestBid(userTotalAfter);
            auction.setHighestBidder(user);
        }
        auction.setBidCount(auction.getBidCount() + 1);

        BidResponse response = toResponse(bid, currency, userTotalAfter);
        // Push the new bid to all subscribers watching this auction in real-time
        broadcastService.broadcastNewBid(auctionId, response);

        // Notify the previous highest bidder that they have been outbid
        if (becomesHighest && previousHighestBidder != null && !previousHighestBidder.getId().equals(userId)) {
            String productName = auction.getProduct() != null ? auction.getProduct().getName() : "the auction";
            broadcastService.broadcastOutbid(
                    previousHighestBidder.getId(), auctionId, productName, userTotalAfter, currency);

            if (hasReachedMaxBid(auction)) {
                auctionService.finalizeAsSold(auction, user);
                return response;
            }

            // Trigger auto bid cascade for the outbid user
            resolveAutoBidChain(auction, previousHighestBidder);
        } else if (hasReachedMaxBid(auction)) {
            auctionService.finalizeAsSold(auction, user);
            return response;
        }

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            return response;
        }

        // Anti-sniping: extend end time if bid lands in the last 60 seconds (+90s)
        auctionService.extendEndTimeIfNecessary(auction);

        return response;
    }

    /**
     * Resolves the auto bid chain after a bid is placed.
     * If the outbid user has an active auto bid config, the system places a bid on their behalf,
     * which may in turn trigger auto bids for the newly outbid user, and so on.
     * The loop terminates when a user has no auto bid config or their max limit is exceeded.
     */
    void resolveAutoBidChain(Auction auction, User outbidUser) {
        String currency = auction.getCurrency();
        String productName = auction.getProduct() != null ? auction.getProduct().getName() : "the auction";

        User currentOutbidUser = outbidUser;

        while (currentOutbidUser != null) {
            Optional<AutoBidConfig> configOpt = autoBidConfigRepository
                    .findByAuctionIdAndUserIdAndEnabledTrue(auction.getId(), currentOutbidUser.getId());

            if (configOpt.isEmpty()) break;

            AutoBidConfig config = configOpt.get();
            BigDecimal userTotalBefore = getUserTotalBid(auction.getId(), currentOutbidUser.getId());
            BigDecimal nextBidAmount = config.getIncrement();
            BigDecimal userTotalAfter = userTotalBefore.add(nextBidAmount);

            if (userTotalAfter.compareTo(config.getMaxLimit()) > 0) {
                // Max limit reached — notify user and stop the chain
                broadcastService.broadcastAutoBidMaxReached(
                        currentOutbidUser.getId(), auction.getId(), productName, config.getMaxLimit(), currency);
                break;
            }

            // Also respect the auction's global max bid cap if set
            if (auction.getMaxBidAmount() != null && userTotalAfter.compareTo(auction.getMaxBidAmount()) > 0) {
                break;
            }

            User autoBidUser = currentOutbidUser;
            User previousHighest = auction.getHighestBidder();

            Bid autoBid = Bid.builder()
                    .auction(auction)
                    .user(autoBidUser)
                    .amount(nextBidAmount)
                    .autoBid(true)
                    .build();
            bidRepository.save(autoBid);

            if (userTotalAfter.compareTo(auction.getCurrentHighestBid()) > 0) {
                auction.setCurrentHighestBid(userTotalAfter);
                auction.setHighestBidder(autoBidUser);
            }
            auction.setBidCount(auction.getBidCount() + 1);

            auctionService.extendEndTimeIfNecessary(auction);
            broadcastService.broadcastNewBid(auction.getId(), toResponse(autoBid, currency, userTotalAfter));

            if (auction.getHighestBidder() != null
                    && auction.getHighestBidder().getId().equals(autoBidUser.getId())
                    && previousHighest != null
                    && !previousHighest.getId().equals(autoBidUser.getId())) {
                broadcastService.broadcastOutbid(
                        previousHighest.getId(), auction.getId(), productName, userTotalAfter, currency);
            }

            if (hasReachedMaxBid(auction)) {
                auctionService.finalizeAsSold(auction, autoBidUser);
                break;
            }

            // The user who was just outbid by this auto bid is now the candidate for the next round
            currentOutbidUser = previousHighest;
        }
    }

    private boolean hasReachedMaxBid(Auction auction) {
        return auction.getMaxBidAmount() != null
                && auction.getCurrentHighestBid().compareTo(auction.getMaxBidAmount()) >= 0;
    }

    BigDecimal getNextAllowedBid(Auction auction) {
        return auction.getCurrentHighestBid().add(getBidIncrement(auction));
    }

    private BigDecimal getBidIncrement(Auction auction) {
        return auction.getBidIncrement() != null && auction.getBidIncrement().compareTo(BigDecimal.ZERO) > 0
                ? auction.getBidIncrement()
                : BigDecimal.ONE;
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getBidsForAuction(Long auctionId) {
        Auction auction = auctionService.findById(auctionId);
        String currency = auction.getCurrency();
        return bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId)
                .stream()
                .map(b -> toResponse(b, currency, getUserTotalBid(b.getAuction().getId(), b.getUser().getId())))
                .toList();
    }

    /** Returns all bids placed by the given user, enriched with auction and product context. */
    @Transactional(readOnly = true)
    public List<MyBidResponse> getMyBids(Long userId) {
        return bidRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(bid -> {
                    Auction auction = bid.getAuction();
                    BigDecimal userTotal = getUserTotalBid(auction.getId(), userId);
                    boolean isWinning = auction.getHighestBidder() != null
                            && auction.getHighestBidder().getId().equals(userId)
                            && userTotal.compareTo(auction.getCurrentHighestBid()) == 0;

                    List<String> imageUrls = auction.getProduct() != null
                            ? auction.getProduct().getImages().stream()
                                .map(img -> img.getImageUrl())
                                .toList()
                            : List.of();

                    return MyBidResponse.builder()
                            .id(bid.getId())
                            .amount(bid.getAmount())
                            .currency(auction.getCurrency())
                            .createdAt(bid.getCreatedAt())
                            .isWinning(isWinning)
                            .auctionId(auction.getId())
                            .auctionStatus(auction.getStatus())
                            .currentHighestBid(auction.getCurrentHighestBid())
                            .scheduledEndTime(auction.getScheduledEndTime())
                            .productId(auction.getProduct() != null ? auction.getProduct().getId() : null)
                            .productName(auction.getProduct() != null ? auction.getProduct().getName() : null)
                            .brand(auction.getProduct() != null ? auction.getProduct().getBrand() : null)
                            .imageUrls(imageUrls)
                            .build();
                })
                .toList();
    }

    private BigDecimal getUserTotalBid(Long auctionId, Long userId) {
        BigDecimal total = bidRepository.sumAmountByAuctionIdAndUserId(auctionId, userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    private BidResponse toResponse(Bid bid, String currency, BigDecimal bidderTotalAmount) {
        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction().getId())
                .bidderId(bid.getUser().getId())
                .bidderName(bid.getUser().getNickname() != null ? bid.getUser().getNickname() : bid.getUser().getName())
                .amount(bidderTotalAmount)
                .offerAmount(bid.getAmount())
                .bidderTotalAmount(bidderTotalAmount)
                .currency(currency)
                .createdAt(bid.getCreatedAt())
                .autoBid(bid.isAutoBid())
                .build();
    }
}
