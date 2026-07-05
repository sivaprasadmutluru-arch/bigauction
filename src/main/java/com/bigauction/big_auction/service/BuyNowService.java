package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.response.OrderResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.Order;
import com.bigauction.big_auction.entity.Product;
import com.bigauction.big_auction.entity.User;
import com.bigauction.big_auction.enums.OrderType;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.AuctionRepository;
import com.bigauction.big_auction.repository.OrderRepository;
import com.bigauction.big_auction.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BuyNowService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final AuctionService auctionService;

    /**
     * Handles a Buy Now purchase.
     * - Validates the product is available and Buy Now is permitted
     * - Rejects reward credits because they are only valid for auction tickets
     * - Creates the order
     * - Closes the auction (if one exists) and distributes credits to ticket holders
     */
    @Transactional
    public OrderResponse buyNow(Long productId, Long userId, BigDecimal creditToApply,
                                String shippingName, String shippingPhone,
                                String shippingAddress, String shippingCity, String shippingCountry) {
        Product product = productService.findById(productId);

        if (product.isSold()) {
            throw new AppException(HttpStatus.CONFLICT, "This product has already been sold");
        }
        if (product.getBuyNowPrice() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "This product does not have a Buy Now price");
        }

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if there's an active auction — if so, Buy Now must be permitted on it
        Optional<Auction> auctionOpt = auctionRepository.findByProductId(productId);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();
            if (!auctionService.isBuyNowCurrentlyAvailable(auction)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Buy Now is not available for this auction at this time");
            }
        }

        BigDecimal basePrice = product.getBuyNowPrice();

        if (creditToApply != null && creditToApply.compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Reward credits can only be used for future auction ticket purchases, not Buy Now purchases.");
        }

        BigDecimal totalAmount = basePrice;

        Order order = Order.builder()
                .user(buyer)
                .product(product)
                .auction(auctionOpt.orElse(null))
                .type(OrderType.BUY_NOW)
                .totalAmount(totalAmount)
                .creditApplied(BigDecimal.ZERO)
                .shippingName(shippingName)
                .shippingPhone(shippingPhone)
                .shippingAddress(shippingAddress)
                .shippingCity(shippingCity)
                .shippingCountry(shippingCountry)
                .build();

        orderRepository.save(order);

        // Finalize: mark product sold, close auction, distribute credits to losers
        product.setSold(true);
        if (auctionOpt.isPresent()) {
            auctionService.finalizeAsInstantBuy(auctionOpt.get(), buyer);
        }

        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
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
