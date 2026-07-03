package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.response.OrderResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.Order;
import com.bigauction.big_auction.enums.AuctionStatus;
import com.bigauction.big_auction.enums.OrderType;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuctionCheckoutService {

    private final AuctionService auctionService;
    private final OrderRepository orderRepository;

    /**
     * Called by the auction winner to complete their purchase.
     * The winner pays their winning bid amount. Reward credits are not valid for winning item payments.
     */
    @Transactional
    public OrderResponse checkout(Long auctionId, Long userId, BigDecimal creditToApply,
                                  String shippingName, String shippingPhone,
                                  String shippingAddress, String shippingCity, String shippingCountry) {
        Auction auction = auctionService.findById(auctionId);

        if (auction.getStatus() != AuctionStatus.SOLD) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Auction is not finalized yet");
        }
        if (auction.getWinner() == null || !auction.getWinner().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not the winner of this auction");
        }
        if (orderRepository.existsByAuctionIdAndUserId(auctionId, userId)) {
            throw new AppException(HttpStatus.CONFLICT, "You have already completed checkout for this auction");
        }

        // Winner pays their winning bid amount
        BigDecimal winningBid = auction.getCurrentHighestBid();

        if (creditToApply != null && creditToApply.compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Reward credits can only be used for future auction ticket purchases, not winning item payments.");
        }

        BigDecimal totalAmount = winningBid;

        Order order = Order.builder()
                .user(auction.getWinner())
                .product(auction.getProduct())
                .auction(auction)
                .type(OrderType.AUCTION_WIN)
                .totalAmount(totalAmount)
                .creditApplied(BigDecimal.ZERO)
                .shippingName(shippingName)
                .shippingPhone(shippingPhone)
                .shippingAddress(shippingAddress)
                .shippingCity(shippingCity)
                .shippingCountry(shippingCountry)
                .build();

        orderRepository.save(order);

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .productName(order.getProduct().getName())
                .productBrand(order.getProduct().getBrand())
                .type(order.getType())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .creditApplied(order.getCreditApplied())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingCountry(order.getShippingCountry())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
