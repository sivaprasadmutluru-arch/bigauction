package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.response.OrderResponse;
import com.bigauction.big_auction.entity.Order;
import com.bigauction.big_auction.enums.OrderStatus;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final WalletService walletService;
    private final BroadcastService broadcastService;

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Order not found"));

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        orderRepository.save(order);

        if (newStatus != previousStatus) {
            // Guard against double refund if admin cancels the same order more than once
            if (newStatus == OrderStatus.CANCELLED && previousStatus != OrderStatus.CANCELLED) {
                walletService.refundCancelledOrder(order.getUser().getId(), order.getTotalAmount(), order.getId());
            }
            broadcastService.broadcastOrderStatusChanged(
                    order.getUser().getId(), order.getId(), order.getProduct().getName(), newStatus);
        }

        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .productId(order.getProduct().getId())
                .auctionId(order.getAuction() != null ? order.getAuction().getId() : null)
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
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
