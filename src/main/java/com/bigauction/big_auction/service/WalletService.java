package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.response.WalletResponse;
import com.bigauction.big_auction.dto.response.WalletTransactionResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.CreditConfig;
import com.bigauction.big_auction.entity.Ticket;
import com.bigauction.big_auction.entity.Wallet;
import com.bigauction.big_auction.entity.WalletTransaction;
import com.bigauction.big_auction.enums.TransactionReason;
import com.bigauction.big_auction.enums.TransactionType;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.CreditConfigRepository;
import com.bigauction.big_auction.repository.TicketRepository;
import com.bigauction.big_auction.repository.WalletRepository;
import com.bigauction.big_auction.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final TicketRepository ticketRepository;
    private final CreditConfigRepository creditConfigRepository;

    @Transactional(readOnly = true)
    public WalletResponse getWallet(Long userId) {
        Wallet wallet = getWalletByUserId(userId);
        List<WalletTransactionResponse> transactions = transactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(this::toTransactionResponse)
                .toList();

        return WalletResponse.builder()
                .id(wallet.getId())
                .balance(wallet.getBalance())
                .rewardCredits(wallet.getRewardCredits())
                .transactions(transactions)
                .build();
    }

    /**
     * Issues consolation reward credits to all non-winning ticket holders after a SOLD auction.
     * The credit amount is 3% of the ticket price.
     */
    @Transactional
    public void distributeCreditsToLosers(Auction auction, Long winnerId) {
        List<Ticket> losingTickets = ticketRepository.findByAuctionIdAndUserIdNot(auction.getId(), winnerId);

        losingTickets.stream()
                .map(ticket -> ticket.getUser().getId())
                .distinct()
                .forEach(userId -> {
                    BigDecimal credit = auction.getTicketPrice()
                            .multiply(BigDecimal.valueOf(3))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    CreditConfig config = creditConfigRepository.findAll().stream().findFirst().orElse(null);
                    LocalDateTime expiresAt = config != null && config.isExpiryEnabled() && config.getExpiryDays() != null
                            ? LocalDateTime.now().plusDays(config.getExpiryDays())
                            : null;

                    creditRewardWallet(userId, credit, "Credit for auction #" + auction.getId(), auction.getId(), expiresAt);
                });
    }

    /** Refunds tickets to wallet and awards a 5% reward bonus when Instant Buy cancels the auction. */
    @Transactional
    public void refundTicketsAndDistributeInstantBuyBonuses(Auction auction, Long buyerId) {
        ticketRepository.findByAuctionIdAndUserIdNot(auction.getId(), buyerId).stream()
                .map(ticket -> ticket.getUser().getId())
                .distinct()
                .forEach(userId -> {
                    creditWallet(
                            userId,
                            auction.getTicketPrice(),
                            TransactionReason.TICKET_REFUND,
                            "Ticket refund for Instant Buy cancellation of auction #" + auction.getId(),
                            auction.getId(), null);
                    creditRewardWallet(userId, percentageOfTicketPrice(auction, BigDecimal.valueOf(5)),
                            "5% Instant Buy cancellation reward for auction #" + auction.getId(),
                            auction.getId(), rewardExpiresAt());
                });
    }

    /**
     * Returns the full ticket price to the withdrawable wallet balance when an auction
     * does not start or closes with no winner, then adds the cancellation reward to
     * reward credits for future ticket purchases.
     */
    @Transactional
    public void refundTicketsAndDistributeCancellationRewards(Auction auction) {
        ticketRepository.findByAuctionId(auction.getId()).stream()
                .map(ticket -> ticket.getUser().getId())
                .distinct()
                .forEach(userId -> {
                    creditWallet(
                            userId,
                            auction.getTicketPrice(),
                            TransactionReason.TICKET_REFUND,
                            "Ticket refund for cancelled auction #" + auction.getId(),
                            auction.getId(), null);
                    creditRewardWallet(userId, percentageOfTicketPrice(auction, BigDecimal.valueOf(5)),
                            "5% cancelled auction reward for auction #" + auction.getId(),
                            auction.getId(), rewardExpiresAt());
                });
    }

    /**
     * Deducts credit for a purchase. Reward credits are consumed first, then wallet balance.
     * Returns the actual amount deducted (capped by total available and config limits).
     */
    @Transactional
    public BigDecimal applyCredit(Long userId, BigDecimal requestedCredit, TransactionReason reason, Long auctionId) {
        CreditConfig config = creditConfigRepository.findAll().stream().findFirst().orElse(null);
        Wallet wallet = getWalletByUserId(userId);

        BigDecimal maxCredit = config != null ? config.getMaxCreditPerPurchase() : requestedCredit;
        BigDecimal totalAvailable = wallet.getRewardCredits().add(wallet.getBalance());
        BigDecimal applicable = requestedCredit.min(maxCredit).min(totalAvailable);

        if (applicable.compareTo(BigDecimal.ZERO) > 0) {
            // Drain reward credits first
            BigDecimal fromReward = applicable.min(wallet.getRewardCredits());
            if (fromReward.compareTo(BigDecimal.ZERO) > 0) {
                wallet.setRewardCredits(wallet.getRewardCredits().subtract(fromReward));
            }
            BigDecimal fromBalance = applicable.subtract(fromReward);
            if (fromBalance.compareTo(BigDecimal.ZERO) > 0) {
                wallet.setBalance(wallet.getBalance().subtract(fromBalance));
            }
            walletRepository.save(wallet);

            WalletTransaction tx = WalletTransaction.builder()
                    .wallet(wallet)
                    .type(TransactionType.DEBIT)
                    .reason(reason)
                    .amount(applicable)
                    .auctionId(auctionId)
                    .build();
            transactionRepository.save(tx);
        }

        return applicable;
    }

    @Transactional
    public void debitForTicket(Long userId, BigDecimal ticketPrice, Long auctionId) {
        Wallet wallet = getWalletByUserId(userId);
        if (wallet.getBalance().compareTo(ticketPrice) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Insufficient wallet balance. Please top up your wallet to purchase a ticket.");
        }
        wallet.setBalance(wallet.getBalance().subtract(ticketPrice));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(TransactionType.DEBIT)
                .reason(TransactionReason.TICKET_PURCHASE)
                .amount(ticketPrice)
                .auctionId(auctionId)
                .build();
        transactionRepository.save(tx);
    }

    @Transactional
    public void debitForAuctionWin(Long userId, BigDecimal winningBid, Long auctionId) {
        Wallet wallet = getWalletByUserId(userId);
        if (wallet.getBalance().compareTo(winningBid) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Insufficient wallet balance. Please pay by card or top up your wallet to complete this auction win.");
        }

        wallet.setBalance(wallet.getBalance().subtract(winningBid));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(TransactionType.DEBIT)
                .reason(TransactionReason.AUCTION_WIN_PURCHASE)
                .amount(winningBid)
                .auctionId(auctionId)
                .note("Winning bid payment for auction #" + auctionId)
                .build();
        transactionRepository.save(tx);
    }

    @Transactional
    public BigDecimal debitForTicketUsingRewardCredits(Long userId, BigDecimal ticketPrice,
                                                       BigDecimal requestedCredit, Long auctionId) {
        Wallet wallet = getWalletByUserId(userId);
        BigDecimal requested = requestedCredit == null ? BigDecimal.ZERO : requestedCredit;
        if (requested.compareTo(BigDecimal.ZERO) <= 0) {
            debitForTicket(userId, ticketPrice, auctionId);
            return BigDecimal.ZERO;
        }

        BigDecimal rewardCreditApplied = requested.min(wallet.getRewardCredits()).min(ticketPrice);
        BigDecimal walletAmount = ticketPrice.subtract(rewardCreditApplied);

        if (rewardCreditApplied.compareTo(BigDecimal.ZERO) == 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "No reward credits are available for this ticket purchase.");
        }
        if (wallet.getBalance().compareTo(walletAmount) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Insufficient wallet balance after applying available reward credits for this ticket purchase.");
        }

        wallet.setRewardCredits(wallet.getRewardCredits().subtract(rewardCreditApplied));
        wallet.setBalance(wallet.getBalance().subtract(walletAmount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(TransactionType.DEBIT)
                .reason(TransactionReason.TICKET_PURCHASE)
                .amount(ticketPrice)
                .auctionId(auctionId)
                .note("Reward credits applied: " + rewardCreditApplied.toPlainString())
                .build();
        transactionRepository.save(tx);

        return rewardCreditApplied;
    }

    @Transactional
    public void adminAdjustCredit(Long userId, BigDecimal amount, String note) {
        creditWallet(userId, amount, TransactionReason.ADMIN_ADJUSTMENT, note, null, null);
    }

    @Transactional
    public void approveDeposit(Long userId, BigDecimal amount, Long depositId) {
        creditWallet(userId, amount, TransactionReason.WALLET_DEPOSIT,
                "Wallet top-up #" + depositId + " credited", null, null);
    }

    @Transactional
    public void refundCancelledOrder(Long userId, BigDecimal amount, Long orderId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) return;
        creditWallet(userId, amount, TransactionReason.ORDER_CANCEL_REFUND,
                "Refund for cancelled order #" + orderId, null, null);
    }

    /**
     * Scheduler: runs once a day to expire credits whose expiry date has passed.
     * For each expired credit transaction, the amount is deducted from the wallet balance
     * and the transaction is marked as expired so it is not processed again.
     */
    @Scheduled(cron = "0 0 2 * * *") // Runs every day at 2:00 AM
    @Transactional
    public void expireStaleCredits() {
        List<WalletTransaction> expired = transactionRepository
                .findByTypeAndExpiredFalseAndExpiresAtIsNotNullAndExpiresAtBefore(
                        TransactionType.CREDIT,
                        LocalDateTime.now()
                );

        for (WalletTransaction tx : expired) {
            Wallet wallet = tx.getWallet();
            BigDecimal deduction = tx.getAmount().min(wallet.getRewardCredits());
            wallet.setRewardCredits(wallet.getRewardCredits().subtract(deduction));
            walletRepository.save(wallet);

            tx.setExpired(true);
            transactionRepository.save(tx);
        }
    }

    // ---- Private helpers ----

    /** Credits non-withdrawable reward credits (AUCTION_LOSS_CREDIT). Tracked in rewardCredits, not balance. */
    private void creditRewardWallet(Long userId, BigDecimal amount, String note, Long auctionId, LocalDateTime expiresAt) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) return;
        Wallet wallet = getWalletByUserId(userId);
        wallet.setRewardCredits(wallet.getRewardCredits().add(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(TransactionType.CREDIT)
                .reason(TransactionReason.AUCTION_LOSS_CREDIT)
                .amount(amount)
                .auctionId(auctionId)
                .note(note)
                .expiresAt(expiresAt)
                .build();
        transactionRepository.save(tx);
    }

    private void creditWallet(Long userId, BigDecimal amount, TransactionReason reason,
                               String note, Long auctionId, LocalDateTime expiresAt) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) return;
        Wallet wallet = getWalletByUserId(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(TransactionType.CREDIT)
                .reason(reason)
                .amount(amount)
                .auctionId(auctionId)
                .note(note)
                .expiresAt(expiresAt)
                .build();
        transactionRepository.save(tx);
    }

    private Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Wallet not found for user"));
    }

    private BigDecimal percentageOfTicketPrice(Auction auction, BigDecimal percentage) {
        return auction.getTicketPrice()
                .multiply(percentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private LocalDateTime rewardExpiresAt() {
        CreditConfig config = creditConfigRepository.findAll().stream().findFirst().orElse(null);
        return config != null && config.isExpiryEnabled() && config.getExpiryDays() != null
                ? LocalDateTime.now().plusDays(config.getExpiryDays())
                : null;
    }

    private WalletTransactionResponse toTransactionResponse(WalletTransaction tx) {
        return WalletTransactionResponse.builder()
                .id(tx.getId())
                .type(tx.getType())
                .reason(tx.getReason())
                .amount(tx.getAmount())
                .note(tx.getNote())
                .expiresAt(tx.getExpiresAt())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
