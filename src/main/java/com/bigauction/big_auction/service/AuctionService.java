package com.bigauction.big_auction.service;

import com.bigauction.big_auction.dto.request.AuctionRequest;
import com.bigauction.big_auction.dto.response.AuctionResponse;
import com.bigauction.big_auction.entity.Auction;
import com.bigauction.big_auction.entity.Product;
import com.bigauction.big_auction.entity.User;
import com.bigauction.big_auction.enums.AuctionStartCondition;
import com.bigauction.big_auction.enums.AuctionStatus;
import com.bigauction.big_auction.exception.AppException;
import com.bigauction.big_auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final ProductService productService;
    private final WalletService walletService;
    private final BroadcastService broadcastService;

    @Transactional
    public AuctionResponse createAuction(AuctionRequest request) {
        Product product = productService.findById(request.getProductId());

        if (product.isSold()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Cannot create an auction for a sold product");
        }

        // Block if an active, pending, or sold auction already exists
        boolean hasActiveAuction = auctionRepository.findByProductIdAndStatusIn(
                product.getId(),
                List.of(AuctionStatus.PENDING, AuctionStatus.ACTIVE, AuctionStatus.SOLD)
        ).isPresent();
        if (hasActiveAuction) {
            throw new AppException(HttpStatus.CONFLICT, "This product already has an active or sold auction");
        }

        // If a CLOSED auction exists, reset it (DB unique constraint prevents a second row)
        Auction auction = auctionRepository.findByProductId(product.getId()).orElse(null);
        if (auction != null) {
            auction.setStatus(AuctionStatus.PENDING);
            auction.setCurrentHighestBid(BigDecimal.ZERO);
            auction.setBidCount(0);
            auction.setTicketsSold(0);
            auction.setHighestBidder(null);
            auction.setWinner(null);
            auction.setActualStartTime(null);
            auction.setEndTime(null);
        } else {
            auction = Auction.builder().product(product).build();
        }

        auction.setTicketPrice(request.getTicketPrice());
        auction.setTicketTarget(request.getTicketTarget());
        auction.setStartCondition(request.getStartCondition());
        auction.setScheduledStartTime(request.getScheduledStartTime());
        auction.setScheduledEndTime(request.getScheduledEndTime());
        auction.setBuyNowEnabled(request.isBuyNowEnabled());
        auction.setBuyNowActivationRule(request.getBuyNowActivationRule());
        auction.setBuyNowActivationTime(request.getBuyNowActivationTime());
        auction.setBuyNowActivationThreshold(request.getBuyNowActivationThreshold());
        auction.setEstimateLow(request.getEstimateLow());
        auction.setEstimateHigh(request.getEstimateHigh());
        auction.setReservePrice(request.getReservePrice());
        auction.setBidIncrement(request.getBidIncrement());
        auction.setMaxBidAmount(request.getMaxBidAmount());
        auction.setCurrency(request.getCurrency() != null && !request.getCurrency().isBlank()
                ? request.getCurrency().toUpperCase() : "AED");

        auctionRepository.save(auction);
        return toResponse(auction);
    }

    @Transactional(readOnly = true)
    public AuctionResponse getAuction(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getAllAuctions() {
        return auctionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getAuctionsByStatus(AuctionStatus status) {
        return auctionRepository.findByStatus(status).stream().map(this::toResponse).toList();
    }

    /** Admin manually activates an auction. */
    @Transactional
    public AuctionResponse activateAuction(Long auctionId) {
        Auction auction = findById(auctionId);
        assertStatus(auction, AuctionStatus.PENDING, "Only PENDING auctions can be activated");
        activateNow(auction);
        return toResponse(auction);
    }

    /** Admin manually closes an auction with no winner (force close). */
    @Transactional
    public AuctionResponse closeAuction(Long auctionId) {
        Auction auction = findById(auctionId);
        assertStatus(auction, AuctionStatus.ACTIVE, "Only ACTIVE auctions can be closed");
        closeWithoutWinner(auction);
        return toResponse(auction);
    }

    /** Admin manually declares the current highest bidder as winner. */
    @Transactional
    public AuctionResponse closeWithWinner(Long auctionId) {
        Auction auction = findById(auctionId);
        assertStatus(auction, AuctionStatus.ACTIVE, "Only ACTIVE auctions can be closed");
        if (auction.getHighestBidder() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "No bids have been placed — cannot declare a winner");
        }
        finalizeAsSold(auction, auction.getHighestBidder());
        return toResponse(auction);
    }

    /**
     * Marks the auction as SOLD and distributes credits to non-winners.
     * Called by BuyNowService (Buy Now) and AuctionCheckoutService (auction win).
     */
    @Transactional
    public void finalizeAsSold(Auction auction, User winner) {
        finalizeSale(auction, winner, false);
    }

    @Transactional
    public void finalizeAsInstantBuy(Auction auction, User buyer) {
        finalizeSale(auction, buyer, true);
    }

    private void finalizeSale(Auction auction, User winner, boolean instantBuy) {
        auction.setStatus(AuctionStatus.SOLD);
        auction.setEndTime(LocalDateTime.now());
        auction.setWinner(winner);
        auctionRepository.save(auction);

        // Mark the product as sold
        Product product = productService.findById(auction.getProduct().getId());
        product.setSold(true);

        if (instantBuy) walletService.distributeInstantBuyBonuses(auction, winner.getId());
        else walletService.distributeCreditsToLosers(auction, winner.getId());
        broadcastService.broadcastAuctionStatus(auction.getId(), toResponse(auction));

        // Notify the winner personally
        String productName = auction.getProduct() != null ? auction.getProduct().getName() : "the item";
        broadcastService.broadcastWinner(
                winner.getId(), auction.getId(), productName,
                auction.getCurrentHighestBid(), auction.getCurrency());
    }

    /**
     * Scheduler: auto-activates PENDING scheduled auctions whose start time has arrived.
     * Runs every minute.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void autoActivateScheduledAuctions() {
        auctionRepository.findByStatusAndStartConditionAndScheduledStartTimeBefore(
                AuctionStatus.PENDING,
                AuctionStartCondition.SCHEDULED,
                LocalDateTime.now()
        ).forEach(this::activateNow);
    }

    /**
     * Scheduler: auto-closes ACTIVE auctions whose scheduled end time has passed.
     * If there are bids, the highest bidder wins (status = SOLD).
     * If no bids, the auction closes with no winner (status = CLOSED) and ticket holders still get credits.
     * Runs every minute.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void autoCloseExpiredAuctions() {
        auctionRepository.findByStatusAndScheduledEndTimeIsNotNullAndScheduledEndTimeBefore(
                AuctionStatus.ACTIVE,
                LocalDateTime.now()
        ).forEach(auction -> {
            boolean reserveMet = auction.getReservePrice() == null
                    || auction.getReservePrice().compareTo(BigDecimal.ZERO) == 0
                    || auction.getCurrentHighestBid().compareTo(auction.getReservePrice()) >= 0;

            if (auction.getHighestBidder() != null && reserveMet) {
                finalizeAsSold(auction, auction.getHighestBidder());
            } else {
                closeWithoutWinner(auction);
            }
        });
    }

    /**
     * If a bid lands within the last 60 seconds, extend by 90 seconds (anti-sniping).
     * Broadcasts the updated status to all WebSocket subscribers so countdowns update in real time.
     */
    @Transactional
    public void extendEndTimeIfNecessary(Auction auction) {
        if (auction.getScheduledEndTime() == null) return;
        long secondsLeft = ChronoUnit.SECONDS.between(LocalDateTime.now(), auction.getScheduledEndTime());
        if (secondsLeft >= 0 && secondsLeft <= 60) {
            auction.setScheduledEndTime(auction.getScheduledEndTime().plusSeconds(90));
            auctionRepository.save(auction);
            broadcastService.broadcastAuctionStatus(auction.getId(), toResponse(auction));
        }
    }

    // ---- Shared helpers ----

    public Auction findById(Long id) {
        return auctionRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Auction not found"));
    }

    public boolean isBuyNowCurrentlyAvailable(Auction auction) {
        if (!auction.isBuyNowEnabled() || auction.getStatus() != AuctionStatus.PENDING) return false;
        if (auction.getBuyNowActivationRule() == null) return false;

        return switch (auction.getBuyNowActivationRule()) {
            case IMMEDIATE -> true;
            case TIME_BASED -> auction.getBuyNowActivationTime() != null
                    && LocalDateTime.now().isAfter(auction.getBuyNowActivationTime());
            case THRESHOLD_BASED -> auction.getBuyNowActivationThreshold() != null
                    && ticketPercentSold(auction) >= auction.getBuyNowActivationThreshold();
        };
    }

    private int ticketPercentSold(Auction auction) {
        if (auction.getTicketTarget() == 0) return 0;
        return (auction.getTicketsSold() * 100) / auction.getTicketTarget();
    }

    private void activateNow(Auction auction) {
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setActualStartTime(LocalDateTime.now());
        auctionRepository.save(auction);
        broadcastService.broadcastAuctionStatus(auction.getId(), toResponse(auction));
    }

    private void closeWithoutWinner(Auction auction) {
        auction.setStatus(AuctionStatus.CLOSED);
        auction.setEndTime(LocalDateTime.now());
        auctionRepository.save(auction);
        walletService.refundTicketsAsCredits(auction);
        broadcastService.broadcastAuctionStatus(auction.getId(), toResponse(auction));

        // Notify every ticket holder that the auction closed with no winner
        String productName = auction.getProduct() != null ? auction.getProduct().getName() : "the item";
        auction.getTickets().forEach(ticket ->
                broadcastService.broadcastAuctionClosed(
                        ticket.getUser().getId(), auction.getId(), productName, auction.getCurrency()));
    }

    private void assertStatus(Auction auction, AuctionStatus expected, String errorMessage) {
        if (auction.getStatus() != expected) {
            throw new AppException(HttpStatus.BAD_REQUEST, errorMessage);
        }
    }

    public AuctionResponse toResponse(Auction auction) {
        String highestBidderName = auction.getHighestBidder() != null
                ? auction.getHighestBidder().getName()
                : null;
        Long winnerId   = auction.getWinner() != null ? auction.getWinner().getId()   : null;
        String winnerName = auction.getWinner() != null ? auction.getWinner().getName() : null;

        AuctionResponse.ProductSummary productSummary = null;
        if (auction.getProduct() != null) {
            var p = auction.getProduct();
            List<String> imageUrls = p.getImages().stream()
                    .map(com.bigauction.big_auction.entity.ProductImage::getImageUrl)
                    .toList();
            productSummary = AuctionResponse.ProductSummary.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .brand(p.getBrand())
                    .sourceCountry(p.getSourceCountry())
                    .conditionGrade(p.getConditionGrade())
                    .imageUrls(imageUrls)
                    .buyNowPrice(p.getBuyNowPrice())
                    .sold(p.isSold())
                    .build();
        }

        return AuctionResponse.builder()
                .id(auction.getId())
                .status(auction.getStatus())
                .currency(auction.getCurrency())
                .ticketPrice(auction.getTicketPrice())
                .ticketTarget(auction.getTicketTarget())
                .ticketsSold(auction.getTicketsSold())
                .startCondition(auction.getStartCondition())
                .scheduledStartTime(auction.getScheduledStartTime())
                .scheduledEndTime(auction.getScheduledEndTime())
                .actualStartTime(auction.getActualStartTime())
                .endTime(auction.getEndTime())
                .buyNowEnabled(auction.isBuyNowEnabled())
                .buyNowAvailable(isBuyNowCurrentlyAvailable(auction))
                .buyNowActivationRule(auction.getBuyNowActivationRule())
                .estimateLow(auction.getEstimateLow())
                .estimateHigh(auction.getEstimateHigh())
                .reservePrice(auction.getReservePrice())
                .bidIncrement(auction.getBidIncrement())
                .maxBidAmount(auction.getMaxBidAmount())
                .currentHighestBid(auction.getCurrentHighestBid())
                .bidCount(auction.getBidCount())
                .highestBidderName(highestBidderName)
                .winnerId(winnerId)
                .winnerName(winnerName)
                .createdAt(auction.getCreatedAt())
                .product(productSummary)
                .build();
    }
}
