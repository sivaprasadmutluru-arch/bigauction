package com.bigauction.big_auction.controller;

import com.bigauction.big_auction.common.ApiResponse;
import com.bigauction.big_auction.service.TicketService;
import com.bigauction.big_auction.util.SecurityUtil;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auctions/{auctionId}/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final SecurityUtil securityUtil;

    @PostMapping("/purchase")
    public ResponseEntity<ApiResponse<Void>> purchaseTicket(
            @PathVariable Long auctionId,
            @RequestBody(required = false) TicketPurchaseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = securityUtil.getCurrentUserId(userDetails);
        if (request != null && "REWARD_CREDITS".equalsIgnoreCase(request.getPaymentMethod())) {
            ticketService.purchaseTicketWithRewardCredits(auctionId, userId, request.getCreditToApply());
            return ResponseEntity.ok(ApiResponse.ok("Ticket purchased successfully with reward credits"));
        }

        ticketService.purchaseTicket(auctionId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Ticket purchased successfully"));
    }

    @PostMapping("/purchase-credits")
    public ResponseEntity<ApiResponse<Void>> purchaseTicketWithRewardCredits(
            @PathVariable Long auctionId,
            @RequestBody(required = false) TicketCreditRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        BigDecimal creditToApply = request != null ? request.getCreditToApply() : BigDecimal.ZERO;
        ticketService.purchaseTicketWithRewardCredits(
                auctionId,
                securityUtil.getCurrentUserId(userDetails),
                creditToApply);
        return ResponseEntity.ok(ApiResponse.ok("Ticket purchased successfully with reward credits"));
    }

    @PostMapping("/purchase-card")
    public ResponseEntity<ApiResponse<Void>> purchaseTicketByCard(
            @PathVariable Long auctionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ticketService.purchaseTicketByCard(auctionId, securityUtil.getCurrentUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.ok("Ticket purchased successfully"));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkTicket(
            @PathVariable Long auctionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.ok(ApiResponse.ok("Checked", false));
        boolean has = ticketService.hasTicket(auctionId, securityUtil.getCurrentUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.ok("Checked", has));
    }

    @Getter
    @Setter
    static class TicketPurchaseRequest {
        private String paymentMethod;
        private BigDecimal creditToApply;
    }

    @Getter
    @Setter
    static class TicketCreditRequest {
        private BigDecimal creditToApply;
    }
}
