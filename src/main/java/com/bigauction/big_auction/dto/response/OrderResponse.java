package com.bigauction.big_auction.dto.response;

import com.bigauction.big_auction.enums.OrderStatus;
import com.bigauction.big_auction.enums.OrderType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long productId;
    private Long auctionId;
    private String productName;
    private String productBrand;
    private OrderType type;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal creditApplied;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingCountry;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
