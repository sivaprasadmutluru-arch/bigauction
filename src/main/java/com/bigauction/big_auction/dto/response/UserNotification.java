package com.bigauction.big_auction.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Pushed via WebSocket to a specific user on:
 *   /topic/users/{userId}/notifications
 *
 * type values: OUTBID, AUCTION_WON, AUCTION_CLOSED, AUTO_BID_MAX_REACHED, ORDER_STATUS
 */
@Getter
@Builder
public class UserNotification {
    private String type;
    private Long auctionId;
    private Long orderId;
    private String productName;
    private BigDecimal amount;
    private String currency;
    private String message;
}
