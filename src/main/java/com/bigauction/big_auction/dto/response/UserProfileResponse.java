package com.bigauction.big_auction.dto.response;

import com.bigauction.big_auction.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String nickname;
    private String email;
    private boolean emailVerified;
    private String phone;
    private boolean phoneVerified;
    private String language;
    private Role role;
    private LocalDateTime createdAt;
    private BigDecimal walletBalance;
    private BigDecimal rewardCredits;
}
