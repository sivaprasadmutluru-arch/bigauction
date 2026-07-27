package com.bigauction.big_auction.controller;

import com.bigauction.big_auction.common.ApiResponse;
import com.bigauction.big_auction.dto.request.AuctionRequest;
import com.bigauction.big_auction.dto.response.AuctionResponse;
import com.bigauction.big_auction.dto.response.MyBidResponse;
import com.bigauction.big_auction.dto.response.OrderResponse;
import com.bigauction.big_auction.enums.AuctionStatus;
import com.bigauction.big_auction.service.AuctionCheckoutService;
import com.bigauction.big_auction.service.AuctionService;
import com.bigauction.big_auction.service.BidService;
import com.bigauction.big_auction.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionCheckoutService auctionCheckoutService;
    private final BidService bidService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuctionResponse>>> getAllAuctions() {
        return ResponseEntity.ok(ApiResponse.ok("Auctions fetched", auctionService.getAllAuctions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuctionResponse>> getAuction(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Auction fetched", auctionService.getAuction(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AuctionResponse>>> getByStatus(@PathVariable AuctionStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Auctions fetched", auctionService.getAuctionsByStatus(status)));
    }

    /** Returns the authenticated user's full bid history across all auctions. */
    @GetMapping("/my-bids")
    public ResponseEntity<ApiResponse<List<MyBidResponse>>> getMyBids(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = securityUtil.getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Bids fetched", bidService.getMyBids(userId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuctionResponse>> createAuction(@Valid @RequestBody AuctionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Auction created", auctionService.createAuction(request)));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuctionResponse>> activate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Auction activated", auctionService.activateAuction(id)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuctionResponse>> close(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Auction closed", auctionService.closeAuction(id)));
    }

    @PostMapping("/{id}/close-with-winner")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuctionResponse>> closeWithWinner(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Auction closed with winner", auctionService.closeWithWinner(id)));
    }

    /**
     * Journey B – Step 5: Auction winner completes checkout.
     * Only the winner can call this. Wallet credit can optionally be applied.
     */
    @PostMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @PathVariable Long id,
            @RequestBody(required = false) CheckoutRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = securityUtil.getCurrentUserId(userDetails);
        BigDecimal credit      = request != null ? request.getCreditToApply()  : BigDecimal.ZERO;
        String paymentMethod   = request != null ? request.getPaymentMethod()  : null;
        BigDecimal cardAmount  = request != null ? request.getCardAmount()     : BigDecimal.ZERO;
        String shippingName    = request != null ? request.getShippingName()    : null;
        String shippingPhone   = request != null ? request.getShippingPhone()   : null;
        String shippingAddress = request != null ? request.getShippingAddress() : null;
        String shippingCity    = request != null ? request.getShippingCity()    : null;
        String shippingCountry = request != null ? request.getShippingCountry() : null;
        return ResponseEntity.ok(ApiResponse.ok("Checkout successful",
                auctionCheckoutService.checkout(id, userId, credit,
                        paymentMethod, cardAmount,
                        shippingName, shippingPhone, shippingAddress, shippingCity, shippingCountry)));
    }

    @Getter
    @Setter
    static class CheckoutRequest {
        private BigDecimal creditToApply;
        private String paymentMethod;
        private BigDecimal cardAmount;
        private String shippingName;
        private String shippingPhone;
        private String shippingAddress;
        private String shippingCity;
        private String shippingCountry;
    }
}
