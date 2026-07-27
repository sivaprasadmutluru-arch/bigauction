package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.response.AuctionResponse;
import com.bigauction.big_auction.dto.response.BidResponse;
import com.bigauction.big_auction.dto.response.UserNotification;
import com.bigauction.big_auction.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Sends real-time updates to WebSocket subscribers.
 *
 * Broadcast topics:
 *   /topic/auctions/{id}/bids           — new bid placed (all subscribers)
 *   /topic/auctions/{id}/status         — auction status changed (all subscribers)
 *
 * User-specific topics:
 *   /topic/users/{userId}/notifications — outbid / winner / auto-bid alerts (that user only)
 *
 * Notification type values: OUTBID, AUCTION_WON, AUCTION_CLOSED, AUTO_BID_MAX_REACHED
 */
@Service
@RequiredArgsConstructor
public class BroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastNewBid(Long auctionId, BidResponse bid) {
        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId + "/bids", bid);
    }

    public void broadcastAuctionStatus(Long auctionId, AuctionResponse auction) {
        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId + "/status", auction);
    }

    /** Notify the previous highest bidder that they have been outbid. */
    public void broadcastOutbid(Long outbidUserId, Long auctionId, String productName,
                                BigDecimal newHighestBid, String currency) {
        UserNotification notification = UserNotification.builder()
                .type("OUTBID")
                .auctionId(auctionId)
                .productName(productName)
                .amount(newHighestBid)
                .currency(currency)
                .message("You have been outbid on " + productName + ". New highest bid: "
                        + currency + " " + newHighestBid.toPlainString())
                .build();
        messagingTemplate.convertAndSend("/topic/users/" + outbidUserId + "/notifications", notification);
    }

    /** Notify the auction winner that they won and should complete checkout. */
    public void broadcastWinner(Long winnerId, Long auctionId, String productName,
                                BigDecimal winningBid, String currency) {
        UserNotification notification = UserNotification.builder()
                .type("AUCTION_WON")
                .auctionId(auctionId)
                .productName(productName)
                .amount(winningBid)
                .currency(currency)
                .message("Congratulations! You won the auction for " + productName
                        + " with a bid of " + currency + " " + winningBid.toPlainString()
                        + ". Please complete your checkout.")
                .build();
        messagingTemplate.convertAndSend("/topic/users/" + winnerId + "/notifications", notification);
    }

    /** Notify a user that their auto bid stopped because the maximum limit was reached and they were outbid. */
    public void broadcastAutoBidMaxReached(Long userId, Long auctionId, String productName,
                                           BigDecimal maxLimit, String currency) {
        UserNotification notification = UserNotification.builder()
                .type("AUTO_BID_MAX_REACHED")
                .auctionId(auctionId)
                .productName(productName)
                .amount(maxLimit)
                .currency(currency)
                .message("Your auto bid limit of " + currency + " " + maxLimit.toPlainString()
                        + " has been reached for " + productName + ". You have been outbid.")
                .build();
        messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", notification);
    }

    /** Notify all ticket holders that an auction closed with no winner. */
    public void broadcastAuctionClosed(Long userId, Long auctionId, String productName, String currency) {
        UserNotification notification = UserNotification.builder()
                .type("AUCTION_CLOSED")
                .auctionId(auctionId)
                .productName(productName)
                .currency(currency)
                .message("The auction for " + productName + " has ended with no winner. "
                        + "Your ticket credit has been returned to your wallet.")
                .build();
        messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", notification);
    }

    /** Notify a customer that their order's fulfilment status changed (admin action). */
    public void broadcastOrderStatusChanged(Long userId, Long orderId, String productName, OrderStatus status) {
        String message = switch (status) {
            case DELIVERED -> "Your order for " + productName + " has been delivered.";
            case CANCELLED -> "Your order for " + productName + " was cancelled. The amount paid has been refunded to your wallet.";
            case CONFIRMED -> "Your order for " + productName + " is confirmed.";
            case PENDING   -> "Your order for " + productName + " is now pending.";
        };
        UserNotification notification = UserNotification.builder()
                .type("ORDER_STATUS")
                .orderId(orderId)
                .productName(productName)
                .message(message)
                .build();
        messagingTemplate.convertAndSend("/topic/users/" + userId + "/notifications", notification);
    }
}
