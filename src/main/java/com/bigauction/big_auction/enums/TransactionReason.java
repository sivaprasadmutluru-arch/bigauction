package com.bigauction.big_auction.enums;

public enum TransactionReason {
    TICKET_PURCHASE,       // Wallet debit when user buys an auction entry ticket
    TICKET_REFUND,         // Full ticket refund when an auction does not start or is cancelled
    AUCTION_LOSS_CREDIT,   // Credit issued because user lost an auction
    BUY_NOW_PURCHASE,      // Credit used during a Buy Now purchase
    AUCTION_WIN_PURCHASE,  // Credit used during an auction win checkout
    ADMIN_ADJUSTMENT,      // Manual credit adjustment by admin
    WALLET_DEPOSIT         // User-initiated deposit approved by admin
}
