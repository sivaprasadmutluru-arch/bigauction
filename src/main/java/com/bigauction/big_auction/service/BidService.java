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
        BigDecimal nextAllowedBid = getNextAllowedBid(auction);

        if (request.getAmount().compareTo(nextAllowedBid) != 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Next bid must be " + currency + " " + nextAllowedBid.toPlainString());
        }
        if (auction.getMaxBidAmount() != null
                && request.getAmount().compareTo(auction.getMaxBidAmount()) > 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Bid exceeds the maximum allowed amount of " + currency + " " + auction.getMaxBidAmount().toPlainString());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // Capture previous highest bidder before overwriting — needed for outbid notification
        User previousHighestBidder = auction.getHighestBidder();

        Bid bid = Bid.builder()
                .auction(auction)
                .user(user)
                .amount(request.getAmount())
                .build();
        bidRepository.save(bid);

        auction.setCurrentHighestBid(request.getAmount());
        auction.setHighestBidder(user);
        auction.setBidCount(auction.getBidCount() + 1);

        // Anti-sniping: extend end time if bid lands in the last 60 seconds (+90s)
        auctionService.extendEndTimeIfNecessary(auction);

        BidResponse response = toResponse(bid, currency);
        // Push the new bid to all subscribers watching this auction in real-time
        broadcastService.broadcastNewBid(auctionId, response);

        // Notify the previous highest bidder that they have been outbid
        if (previousHighestBidder != null && !previousHighestBidder.getId().equals(userId)) {
            String productName = auction.getProduct() != null ? auction.getProduct().getName() : "the auction";
            broadcastService.broadcastOutbid(
                    previousHighestBidder.getId(), auctionId, productName, request.getAmount(), currency);

            // Trigger auto bid cascade for the outbid user
            resolveAutoBidChain(auction, previousHighestBidder);
        }

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
            BigDecimal nextBidAmount = auction.getCurrentHighestBid().add(config.getIncrement());

            if (nextBidAmount.compareTo(config.getMaxLimit()) > 0) {
                // Max limit reached — notify user and stop the chain
                broadcastService.broadcastAutoBidMaxReached(
                        currentOutbidUser.getId(), auction.getId(), productName, config.getMaxLimit(), currency);
                break;
            }

            // Also respect the auction's global max bid cap if set
            if (auction.getMaxBidAmount() != null && nextBidAmount.compareTo(auction.getMaxBidAmount()) > 0) {
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

            auction.setCurrentHighestBid(nextBidAmount);
            auction.setHighestBidder(autoBidUser);
            auction.setBidCount(auction.getBidCount() + 1);

            auctionService.extendEndTimeIfNecessary(auction);
            broadcastService.broadcastNewBid(auction.getId(), toResponse(autoBid, currency));

            if (previousHighest != null && !previousHighest.getId().equals(autoBidUser.getId())) {
                broadcastService.broadcastOutbid(
                        previousHighest.getId(), auction.getId(), productName, nextBidAmount, currency);
            }

            // The user who was just outbid by this auto bid is now the candidate for the next round
            currentOutbidUser = previousHighest;
        }
    }

    BigDecimal getNextAllowedBid(Auction auction) {
        BigDecimal increment = auction.getBidIncrement() != null && auction.getBidIncrement().compareTo(BigDecimal.ZERO) > 0
                ? auction.getBidIncrement()
                : BigDecimal.ONE;
        return auction.getCurrentHighestBid().add(increment);
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getBidsForAuction(Long auctionId) {
        Auction auction = auctionService.findById(auctionId);
        String currency = auction.getCurrency();
        return bidRepository.findByAuctionIdOrderByAmountDesc(auctionId)
                .stream()
                .map(b -> toResponse(b, currency))
                .toList();
    }

    /** Returns all bids placed by the given user, enriched with auction and product context. */
    @Transactional(readOnly = true)
    public List<MyBidResponse> getMyBids(Long userId) {
        return bidRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(bid -> {
                    Auction auction = bid.getAuction();
                    boolean isWinning = auction.getHighestBidder() != null
                            && auction.getHighestBidder().getId().equals(userId)
                            && bid.getAmount().compareTo(auction.getCurrentHighestBid()) == 0;

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

    private BidResponse toResponse(Bid bid, String currency) {
        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction().getId())
                .bidderName(bid.getUser().getName())
                .amount(bid.getAmount())
                .currency(currency)
                .createdAt(bid.getCreatedAt())
                .autoBid(bid.isAutoBid())
                .build();
    }
}
