package com.bigauction.big_auction.repository;

import com.bigauction.big_auction.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuctionIdOrderByAmountDesc(Long auctionId);

    List<Bid> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);

    List<Bid> findByUserId(Long userId);

    List<Bid> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Bid> findTopByAuctionIdOrderByAmountDesc(Long auctionId);

    @Query("select coalesce(sum(b.amount), 0) from Bid b where b.auction.id = :auctionId and b.user.id = :userId")
    BigDecimal sumAmountByAuctionIdAndUserId(@Param("auctionId") Long auctionId, @Param("userId") Long userId);
}
