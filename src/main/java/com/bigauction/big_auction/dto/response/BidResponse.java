package com.bigauction.big_auction.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class BidResponse {
    private Long id;
    private Long auctionId;
    private Long bidderId;
    private String bidderName;
    private BigDecimal amount;
    private BigDecimal offerAmount;
    private BigDecimal bidderTotalAmount;
    private String currency;
    private LocalDateTime createdAt;
    private boolean autoBid;
}
