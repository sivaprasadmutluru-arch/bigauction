package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.request.UpdateProfileRequest;
import com.bigauction.big_auction.dto.response.MyTicketResponse;
import com.bigauction.big_auction.dto.response.UserProfileResponse;
import com.bigauction.big_auction.dto.response.UserSummaryResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.Product;
import com.bigauction.big_auction.entity.Ticket;
import com.bigauction.big_auction.entity.User;
import com.bigauction.big_auction.entity.Wallet;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.TicketRepository;
import com.bigauction.big_auction.repository.UserRepository;
import com.bigauction.big_auction.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findById(userId);
        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
        return toProfileResponse(user, wallet);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findById(userId);
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname().isBlank() ? null : request.getNickname().trim());
        }
        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            user.setLanguage(request.getLanguage());
        }
        userRepository.save(user);
        Wallet wallet = walletRepository.findByUserId(userId).orElse(null);
        return toProfileResponse(user, wallet);
    }

    /** Admin: list all users with their wallet balance. */
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    BigDecimal balance = walletRepository.findByUserId(user.getId())
                            .map(Wallet::getBalance)
                            .orElse(BigDecimal.ZERO);
                    return toSummaryResponse(user, balance);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MyTicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(t -> toMyTicketResponse(t, userId))
                .toList();
    }

    // ---- Helpers ----

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserProfileResponse toProfileResponse(User user, Wallet wallet) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .phone(user.getPhone())
                .phoneVerified(user.isPhoneVerified())
                .language(user.getLanguage())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .walletBalance(wallet != null ? wallet.getBalance() : BigDecimal.ZERO)
                .rewardCredits(wallet != null ? wallet.getRewardCredits() : BigDecimal.ZERO)
                .build();
    }

    private MyTicketResponse toMyTicketResponse(Ticket ticket, Long userId) {
        Auction auction = ticket.getAuction();
        Product product = auction != null ? auction.getProduct() : null;

        List<String> imageUrls = product != null
                ? product.getImages().stream().map(img -> img.getImageUrl()).toList()
                : List.of();

        boolean isWinner = auction != null
                && auction.getWinner() != null
                && auction.getWinner().getId().equals(userId);

        return MyTicketResponse.builder()
                .ticketId(ticket.getId())
                .purchasedAt(ticket.getCreatedAt())
                .ticketPrice(auction != null ? auction.getTicketPrice() : null)
                .currency(auction != null ? auction.getCurrency() : null)
                .auctionId(auction != null ? auction.getId() : null)
                .auctionStatus(auction != null ? auction.getStatus() : null)
                .ticketsSold(auction != null ? auction.getTicketsSold() : 0)
                .ticketTarget(auction != null ? auction.getTicketTarget() : 0)
                .scheduledStartTime(auction != null ? auction.getScheduledStartTime() : null)
                .scheduledEndTime(auction != null ? auction.getScheduledEndTime() : null)
                .currentHighestBid(auction != null ? auction.getCurrentHighestBid() : null)
                .maxBidAmount(auction != null ? auction.getMaxBidAmount() : null)
                .isWinner(isWinner)
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .brand(product != null ? product.getBrand() : null)
                .buyNowPrice(product != null ? product.getBuyNowPrice() : null)
                .imageUrls(imageUrls)
                .build();
    }

    private UserSummaryResponse toSummaryResponse(User user, BigDecimal walletBalance) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .walletBalance(walletBalance)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
