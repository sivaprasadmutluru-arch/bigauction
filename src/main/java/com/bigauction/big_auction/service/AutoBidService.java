package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.request.AutoBidRequest;
import com.bigauction.big_auction.dto.request.BidRequest;
import com.bigauction.big_auction.dto.response.AutoBidConfigResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.AutoBidConfig;
import com.bigauction.big_auction.entity.User;
import com.bigauction.big_auction.enums.AuctionStatus;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.AutoBidConfigRepository;
import com.bigauction.big_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AutoBidService {

    private final AutoBidConfigRepository autoBidConfigRepository;
    private final AuctionService auctionService;
    private final TicketService ticketService;
    private final UserRepository userRepository;
    private final BidService bidService;

    @Transactional
    public AutoBidConfigResponse setupAutoBid(Long auctionId, Long userId, AutoBidRequest request) {
        Auction auction = auctionService.findById(auctionId);

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Auto bid can only be configured for an active auction");
        }
        if (!ticketService.hasTicket(auctionId, userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must purchase a ticket before enabling auto bid");
        }
        BigDecimal nextAllowedBid = bidService.getNextAllowedBid(auction);
        BigDecimal auctionIncrement = getAuctionIncrement(auction);

        if (request.getIncrement().compareTo(auctionIncrement) < 0
                || request.getIncrement().remainder(auctionIncrement).compareTo(BigDecimal.ZERO) != 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Auto bid increment must be an AED amount in multiples of "
                            + auction.getCurrency() + " " + auctionIncrement.toPlainString());
        }
        if (request.getMaxLimit().compareTo(nextAllowedBid) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Maximum limit must allow at least the next bid of "
                            + auction.getCurrency() + " " + nextAllowedBid.toPlainString());
        }
        if (request.getStartingBid() != null) {
            if (request.getStartingBid().compareTo(request.getMaxLimit()) > 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Starting bid cannot exceed the maximum limit");
            }
            if (request.getStartingBid().compareTo(nextAllowedBid) != 0) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Starting bid must be the next AED increment of "
                                + auction.getCurrency() + " " + nextAllowedBid.toPlainString());
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        AutoBidConfig config = autoBidConfigRepository
                .findByAuctionIdAndUserId(auctionId, userId)
                .orElse(AutoBidConfig.builder().auction(auction).user(user).build());

        config.setIncrement(request.getIncrement());
        config.setMaxLimit(request.getMaxLimit());
        config.setEnabled(true);
        autoBidConfigRepository.save(config);

        if (request.getStartingBid() != null) {
            // Place the starting bid immediately — this also triggers cascade for any outbid users
            BidRequest bidRequest = new BidRequest();
            bidRequest.setAmount(request.getStartingBid());
            bidService.placeBid(auctionId, userId, bidRequest);
        } else if (auction.getHighestBidder() != null && !auction.getHighestBidder().getId().equals(userId)) {
            // No starting bid provided but user is already outbid — fire immediately
            bidService.resolveAutoBidChain(auction, user);
        }

        return toResponse(config, auctionId);
    }

    @Transactional(readOnly = true)
    public AutoBidConfigResponse getAutoBid(Long auctionId, Long userId) {
        AutoBidConfig config = autoBidConfigRepository
                .findByAuctionIdAndUserId(auctionId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "No auto bid configuration found"));
        return toResponse(config, auctionId);
    }

    @Transactional
    public void disableAutoBid(Long auctionId, Long userId) {
        AutoBidConfig config = autoBidConfigRepository
                .findByAuctionIdAndUserId(auctionId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "No auto bid configuration found"));
        config.setEnabled(false);
        autoBidConfigRepository.save(config);
    }

    private AutoBidConfigResponse toResponse(AutoBidConfig config, Long auctionId) {
        return AutoBidConfigResponse.builder()
                .auctionId(auctionId)
                .increment(config.getIncrement())
                .maxLimit(config.getMaxLimit())
                .enabled(config.isEnabled())
                .build();
    }

    private BigDecimal getAuctionIncrement(Auction auction) {
        return auction.getBidIncrement() != null && auction.getBidIncrement().compareTo(BigDecimal.ZERO) > 0
                ? auction.getBidIncrement()
                : BigDecimal.ONE;
    }
}
