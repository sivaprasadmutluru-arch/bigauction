package com.bigauction.big_auction.controller;

import com.bigauction.big_auction.common.ApiResponse;
import com.bigauction.big_auction.dto.response.DepositRequestResponse;
import com.bigauction.big_auction.dto.response.WalletResponse;
import com.bigauction.big_auction.entity.DepositRequest;
import com.bigauction.big_auction.entity.User;
import com.bigauction.big_auction.enums.DepositStatus;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.DepositRequestRepository;
import com.bigauction.big_auction.repository.UserRepository;
import com.bigauction.big_auction.service.WalletService;
import com.bigauction.big_auction.util.SecurityUtil;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final SecurityUtil securityUtil;
    private final DepositRequestRepository depositRequestRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<WalletResponse>> getMyWallet(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = securityUtil.getCurrentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Wallet fetched", walletService.getWallet(userId)));
    }

    /** User submits a deposit request (bank transfer reference). */
    @PostMapping("/deposit-request")
    @Transactional
    public ResponseEntity<ApiResponse<DepositRequestResponse>> submitDeposit(
            @RequestBody DepositSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = securityUtil.getCurrentUserId(userDetails);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        DepositRequest deposit = DepositRequest.builder()
                .user(user)
                .amount(request.getAmount())
                .bankReference(request.getBankReference())
                .userNote(request.getUserNote())
                .status(DepositStatus.APPROVED)
                .adminNote("Auto-approved wallet top-up")
                .build();

        depositRequestRepository.save(deposit);
        walletService.approveDeposit(userId, deposit.getAmount(), deposit.getId());

        return ResponseEntity.ok(ApiResponse.ok("Wallet credited successfully", toResponse(deposit)));
    }

    /** User views their own deposit requests. */
    @GetMapping("/deposit-requests")
    public ResponseEntity<ApiResponse<List<DepositRequestResponse>>> getMyDeposits(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = securityUtil.getCurrentUserId(userDetails);
        List<DepositRequestResponse> list = depositRequestRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.ok("Deposit requests fetched", list));
    }

    // ---- Inner classes ----

    @Getter
    @Setter
    static class DepositSubmitRequest {
        @NotNull
        @DecimalMin("1.00")
        private BigDecimal amount;
        @NotBlank
        private String bankReference;
        private String userNote;
    }

    private DepositRequestResponse toResponse(DepositRequest d) {
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
}
