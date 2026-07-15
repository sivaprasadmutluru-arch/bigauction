package com.bigauction.big_auction.controller;

import com.bigauction.big_auction.common.ApiResponse;
import com.bigauction.big_auction.dto.request.CreditConfigRequest;
import com.bigauction.big_auction.dto.response.AutoBidConfigResponse;
import com.bigauction.big_auction.dto.response.DepositRequestResponse;
import com.bigauction.big_auction.dto.response.OrderResponse;
import com.bigauction.big_auction.dto.response.ParticipantResponse;
import com.bigauction.big_auction.dto.response.ReportResponse;
import com.bigauction.big_auction.dto.response.UserSummaryResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.CreditConfig;
import com.bigauction.big_auction.entity.DepositRequest;
import com.bigauction.big_auction.enums.AuctionStatus;
import com.bigauction.big_auction.enums.DepositStatus;
import com.bigauction.big_auction.enums.OrderStatus;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.AutoBidConfigRepository;
import com.bigauction.big_auction.repository.DepositRequestRepository;
import com.bigauction.big_auction.repository.TicketRepository;
import com.bigauction.big_auction.service.AdminService;
import com.bigauction.big_auction.service.AuctionService;
import com.bigauction.big_auction.service.OrderService;
import com.bigauction.big_auction.service.ReportService;
import com.bigauction.big_auction.service.UserService;
import com.bigauction.big_auction.service.WalletService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final AuctionService auctionService;
    private final TicketRepository ticketRepository;
    private final AutoBidConfigRepository autoBidConfigRepository;
    private final ReportService reportService;
    private final UserService userService;
    private final WalletService walletService;
    private final DepositRequestRepository depositRequestRepository;

    // ---- Credit Config ----

    @PostMapping("/credit-config")
    public ResponseEntity<ApiResponse<CreditConfig>> saveCreditConfig(
            @Valid @RequestBody CreditConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Credit configuration saved", adminService.saveCreditConfig(request)));
    }

    // ---- User Wallet Management ----

    @PostMapping("/users/{userId}/credit")
    public ResponseEntity<ApiResponse<Void>> adjustUserCredit(
            @PathVariable Long userId,
            @RequestBody CreditAdjustmentRequest request,
            @AuthenticationPrincipal UserDetails admin) {
        String adminLabel = admin != null ? admin.getUsername() : "unknown-admin";
        String note = "Admin: " + adminLabel + (request.getNote() != null && !request.getNote().isBlank()
                ? " | " + request.getNote()
                : "");
        adminService.adjustUserCredit(userId, request.getAmount(), note);
        return ResponseEntity.ok(ApiResponse.ok("Credit adjusted for user #" + userId));
    }

    // ---- Order Management ----

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok("Orders fetched", orderService.getAllOrders()));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody OrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order status updated",
                orderService.updateOrderStatus(orderId, request.getStatus())));
    }

    // ---- Auction Participant Tracking ----

    @GetMapping("/auctions/{auctionId}/participants")
    public ResponseEntity<ApiResponse<List<ParticipantResponse>>> getParticipants(
            @PathVariable Long auctionId) {

        List<ParticipantResponse> participants = ticketRepository
                .findByAuctionId(auctionId)
                .stream()
                .map(ticket -> ParticipantResponse.builder()
                        .userId(ticket.getUser().getId())
                        .name(ticket.getUser().getName())
                        .email(ticket.getUser().getEmail())
                        .ticketPurchasedAt(ticket.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Participants fetched", participants));
    }

    @GetMapping("/auctions/{auctionId}/auto-bids")
    public ResponseEntity<ApiResponse<List<AutoBidConfigResponse>>> getAutoBidConfigs(
            @PathVariable Long auctionId) {

        List<AutoBidConfigResponse> configs = autoBidConfigRepository
                .findByAuctionIdAndEnabledTrue(auctionId)
                .stream()
                .map(c -> AutoBidConfigResponse.builder()
                        .auctionId(auctionId)
                        .userId(c.getUser().getId())
                        .increment(c.getIncrement())
                        .maxLimit(c.getMaxLimit())
                        .enabled(c.isEnabled())
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Auto bid configs fetched", configs));
    }

    // ---- Winner Tracking ----

    @GetMapping("/auctions/{auctionId}/winner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWinner(@PathVariable Long auctionId) {
        Auction auction = auctionService.findById(auctionId);

        if (auction.getStatus() != AuctionStatus.SOLD || auction.getWinner() == null) {
            return ResponseEntity.ok(ApiResponse.ok("No winner for this auction", null));
        }

        Map<String, Object> winner = Map.of(
                "winnerId", auction.getWinner().getId(),
                "winnerName", auction.getWinner().getName(),
                "winnerEmail", auction.getWinner().getEmail(),
                "winningBid", auction.getCurrentHighestBid(),
                "auctionEndTime", auction.getEndTime()
        );

        return ResponseEntity.ok(ApiResponse.ok("Winner fetched", winner));
    }

    // ---- User Management ----

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", userService.getAllUsers()));
    }

    // ---- Reports & Analytics ----

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport() {
        return ResponseEntity.ok(ApiResponse.ok("Report generated", reportService.generateReport()));
    }

    // ---- Deposit Requests ----

    @GetMapping("/deposit-requests")
    public ResponseEntity<ApiResponse<List<DepositRequestResponse>>> getAllDeposits() {
        List<DepositRequestResponse> list = depositRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDepositResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("Deposit requests fetched", list));
    }

    @PostMapping("/deposit-requests/{id}/approve")
    @Transactional
    public ResponseEntity<ApiResponse<DepositRequestResponse>> approveDeposit(
            @PathVariable Long id,
            @RequestBody(required = false) DepositActionRequest request) {

        DepositRequest deposit = depositRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Deposit request not found"));
        if (deposit.getStatus() != DepositStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Deposit is not pending");
        }

        deposit.setStatus(DepositStatus.APPROVED);
        deposit.setAdminNote(request != null ? request.getNote() : null);
        depositRequestRepository.save(deposit);

        walletService.approveDeposit(deposit.getUser().getId(), deposit.getAmount(), deposit.getId());

        return ResponseEntity.ok(ApiResponse.ok("Deposit approved and wallet credited", toDepositResponse(deposit)));
    }

    @PostMapping("/deposit-requests/{id}/reject")
    @Transactional
    public ResponseEntity<ApiResponse<DepositRequestResponse>> rejectDeposit(
            @PathVariable Long id,
            @RequestBody(required = false) DepositActionRequest request) {

        DepositRequest deposit = depositRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Deposit request not found"));
        if (deposit.getStatus() != DepositStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Deposit is not pending");
        }

        deposit.setStatus(DepositStatus.REJECTED);
        deposit.setAdminNote(request != null ? request.getNote() : null);
        depositRequestRepository.save(deposit);

        return ResponseEntity.ok(ApiResponse.ok("Deposit rejected", toDepositResponse(deposit)));
    }

    private DepositRequestResponse toDepositResponse(DepositRequest d) {
        return DepositRequestResponse.builder()
                .id(d.getId())
                .userId(d.getUser().getId())
                .userName(d.getUser().getName())
                .userEmail(d.getUser().getEmail())
                .amount(d.getAmount())
                .bankReference(d.getBankReference())
                .userNote(d.getUserNote())
                .status(d.getStatus())
                .adminNote(d.getAdminNote())
                .createdAt(d.getCreatedAt())
                .build();
    }

    // ---- Inner request classes ----

    @Getter
    @Setter
    static class CreditAdjustmentRequest {
        private BigDecimal amount;
        private String note;
    }

    @Getter
    @Setter
    static class OrderStatusRequest {
        private OrderStatus status;
    }

    @Getter
    @Setter
    static class DepositActionRequest {
        private String note;
    }
}
