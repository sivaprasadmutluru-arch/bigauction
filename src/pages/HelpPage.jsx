import { useState } from 'react'
import { Link } from 'react-router-dom'

const icons = {
  general: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
  ticket: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  ),
  auction: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M8.25 21V9m0 0L4.5 5.25M8.25 9l3.75-3.75m3.75 15V9m0 0l3.75-3.75M15.75 9l-3.75-3.75" />
    </svg>
  ),
  payment: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  delivery: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  account: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  product: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  support: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
}

const FAQS = [
  {
    category: 'General',
    icon: icons.general,
    items: [
      {
        q: 'What is BigAuction.ae?',
        a: 'BigAuction.ae is a UAE-based auction platform for authenticated luxury goods, including handbags, accessories, collectibles, and selected premium items. Items are reviewed, listed with clear photos and condition details, and held in the UAE before being delivered to the winning buyer or Buy Now purchaser.',
      },
      {
        q: 'Are the items new or pre-owned?',
        a: 'Items may be new, unused, or pre-owned depending on the listing. Each item page will show the available condition details, photos, included accessories, and documents where available. Please review the item page carefully before buying a ticket, bidding, or using Buy Now.',
      },
      {
        q: 'Are the products genuine?',
        a: 'We take authenticity seriously. Each item is reviewed before listing and presented with available details such as brand, model, condition, photos, serial or reference information where applicable, and included accessories or documents. Some items may include original box, card, certificate, receipt, service papers, or third-party authentication, depending on availability.',
      },
      {
        q: 'Is BigAuction.ae available in the UAE and GCC?',
        a: 'Yes. BigAuction.ae is accessible to users in the UAE and GCC. Delivery is available to the UAE and GCC, subject to the delivery options, charges, and requirements shown for each item.',
      },
      {
        q: 'Do I need an account to browse?',
        a: 'You can browse upcoming and live auctions without an account. To purchase a ticket, place a bid, use Buy Now, save favourites, or access your wallet and orders, you will need to create a free account.',
      },
    ],
  },
  {
    category: 'Auction Statuses',
    icon: icons.auction,
    items: [
      {
        q: 'What does Coming Soon mean?',
        a: 'Coming Soon means the item has been announced but the live auction has not started yet. During this stage, users may be able to view item details, buy a ticket, add the item to favourites, or use Buy Now if available.',
      },
      {
        q: 'What does Live Auction mean?',
        a: 'Live Auction means bidding is open. Ticket holders can place bids according to the auction rules and bid increment shown for that item. Buy Now is disabled once the auction is live.',
      },
      {
        q: 'What does Completed mean?',
        a: 'Completed means the auction has ended or the item has been sold. The result may show the winning bid, winner nickname, or Buy Now sale status, depending on the item.',
      },
    ],
  },
  {
    category: 'Tickets',
    icon: icons.ticket,
    items: [
      {
        q: 'What is a ticket and why do I need one?',
        a: 'A ticket is your entry pass to a specific auction. Purchasing a ticket gives you the right to participate and place bids in that auction. A ticket does not guarantee that you will win the item. Only ticket holders can bid.',
      },
      {
        q: 'How much does a ticket cost?',
        a: 'Ticket prices vary by auction and are clearly displayed on each product listing. You can find the ticket price on the product card and item page before purchase.',
      },
      {
        q: 'Can I buy more than one ticket per auction?',
        a: 'No. Each registered user can purchase one ticket per auction. This ensures fair competition for all participants.',
      },
      {
        q: 'Can I bid without buying a ticket?',
        a: 'No. You must purchase a ticket for that specific auction before you can place bids.',
      },
      {
        q: 'Can I get a refund on my ticket?',
        a: 'Tickets are generally non-refundable after purchase. However, if BigAuction.ae cancels an auction or if the item is sold through Buy Now before the live auction starts, all ticket buyers for that auction will receive ticket credit in their BigAuction account and can request a refund from their dashboard according to the refund process. If the auction closes with a winning bidder through bidding, ticket payments are not refunded. Non-winning participants will receive the Reward Credits offered for that auction, according to the reward terms shown on the item page.',
      },
      {
        q: 'What happens if the auction is cancelled?',
        a: 'If an auction is cancelled by BigAuction.ae before completion, all ticket buyers for that auction will receive ticket credit in their BigAuction account and can request a refund from their dashboard according to the refund process.',
      },
    ],
  },
  {
    category: 'Buy Now',
    icon: icons.payment,
    items: [
      {
        q: 'What is Buy Now?',
        a: 'Buy Now allows a user to purchase an item immediately at the displayed Buy Now price, where available. If Buy Now is used successfully, the item is sold without waiting for the live auction.',
      },
      {
        q: 'When is Buy Now available?',
        a: 'Buy Now is available only before the live auction starts, unless the item page states otherwise. Once the auction goes live, Buy Now is disabled and users must participate through bidding.',
      },
      {
        q: 'What happens if someone buys the item using Buy Now?',
        a: 'If an item is sold through Buy Now before the live auction starts, the auction will not proceed. All users who purchased tickets for that auction will receive ticket credit in their BigAuction account. They can then request a refund from their dashboard according to the refund process.',
      },
      {
        q: 'Can I use Buy Now after the auction starts?',
        a: 'No. Once the auction is live, Buy Now is disabled. You can only participate by bidding if you have purchased a ticket.',
      },
      {
        q: 'Do I need a ticket to use Buy Now?',
        a: 'No. Buy Now is a direct purchase option and does not require a ticket, unless the item page clearly states otherwise.',
      },
    ],
  },
  {
    category: 'Bidding & Auto Bid',
    icon: icons.auction,
    items: [
      {
        q: 'What is Manual Bid?',
        a: 'Manual Bid allows you to place each bid yourself during the live auction. Each new bid must follow the minimum bid increment shown for that auction.',
      },
      {
        q: 'What is Auto Bid?',
        a: 'Auto Bid allows you to set your bid increment and maximum bid limit. The system will then place bids automatically on your behalf up to your selected limit. Auto Bid is available only inside the relevant live auction page when enabled for that item.',
      },
      {
        q: 'What is a Bid Increment?',
        a: 'A Bid Increment is the minimum amount by which each new bid must exceed the previous valid bid. For example, if the current bid is AED 1,000 and the increment is AED 50, the next valid bid would be AED 1,050.',
      },
      {
        q: 'Can I bid any amount I want?',
        a: 'No. Bids must follow the bid increment set for that auction. You cannot place a random jump bid unless it matches the allowed bidding rules shown on the auction page.',
      },
      {
        q: 'Can I change my Auto Bid settings during a live auction?',
        a: 'If Auto Bid is available for the auction, you may adjust or stop it according to the controls shown on the live auction page, subject to the auction rules.',
      },
      {
        q: 'What happens if two people bid at the same time?',
        a: 'The bid received first by the system takes priority based on the platform timestamp. BigAuction.ae uses system records to determine bid order.',
      },
      {
        q: 'Is there a minimum bid amount?',
        a: 'Yes. Each auction has a starting bid and bid increment. Your bid must meet or exceed the current highest bid plus the required increment.',
      },
    ],
  },
  {
    category: 'Winning an Auction',
    icon: icons.auction,
    items: [
      {
        q: 'How do I know if I won?',
        a: 'If you win an auction, you will receive a notification through the platform and/or your registered contact details. Your winning auction will also appear in your account area.',
      },
      {
        q: 'What happens after I win?',
        a: 'After winning, go to checkout, choose card or wallet payment, and complete the winning bid payment. Once payment succeeds, your order is confirmed and ready for delivery fulfilment.',
      },
      {
        q: 'When is the winning bid charged?',
        a: 'The winning bid amount is payable after the auction ends and you are the winner. You can complete payment directly through the available checkout methods.',
      },
      {
        q: 'What happens if I win but do not pay?',
        a: 'If the winning bidder does not complete payment within the required deadline, BigAuction.ae may cancel the win, offer the item to another bidder, relist the item, restrict the user account, and/or apply any penalties stated in the auction terms.',
      },
      {
        q: 'Can I cancel after winning?',
        a: 'Auction wins are generally final. If you win an auction, you are expected to complete payment. Any cancellation request will be reviewed by BigAuction.ae on a case-by-case basis.',
      },
    ],
  },
  {
    category: 'Wallet, Reward Credits & Refunds',
    icon: icons.payment,
    items: [
      {
        q: 'What is the BigAuction Wallet?',
        a: 'Your BigAuction Wallet may show two balances: Wallet Balance and Reward Credits. Wallet Balance can be used for eligible payments on the platform where available. Reward Credits are promotional credits that may be used according to their terms.',
      },
      {
        q: 'What are Reward Credits?',
        a: 'Reward Credits are promotional credits issued by BigAuction.ae. They may be used for eligible ticket purchases on the platform, unless stated otherwise. Reward Credits are not cash, cannot be withdrawn, and may have expiry dates or usage conditions.',
      },
      {
        q: 'Do I get rewards if I lose an auction?',
        a: 'Yes. If an auction closes with a winning bidder through bidding, non-winning ticket holders will receive the Reward Credits offered for that auction, according to the reward terms shown on the item page. Ticket payments are not refunded when the auction closes normally with a winning bidder.',
      },
      {
        q: 'Can Reward Credits be used to pay for the final winning item?',
        a: 'No. Reward Credits are generally for eligible ticket purchases only, unless BigAuction.ae clearly states otherwise for a specific promotion or auction.',
      },
      {
        q: 'Can I withdraw Reward Credits?',
        a: 'No. Reward Credits are not cash and cannot be withdrawn, transferred, or exchanged for money. They can only be used for eligible platform activities where available.',
      },
      {
        q: 'What happens to my ticket if the item is sold through Buy Now?',
        a: 'If the item is sold through Buy Now before the live auction starts, your ticket amount will be credited to your BigAuction account. You can use the credit on the platform or request a refund from your dashboard according to the refund process.',
      },
      {
        q: 'Can I get a refund if I lose an auction?',
        a: 'No. If the auction closes with a winning bidder through bidding, ticket payments are not refunded. Non-winning participants receive the Reward Credits offered for that auction instead.',
      },
      {
        q: 'What happens if my payment fails?',
        a: 'If your payment fails, the transaction will not be completed. You may try again using another valid payment method. For auction wins, payment must be completed before the deadline to secure the item.',
      },
    ],
  },
  {
    category: 'Payments',
    icon: icons.payment,
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept Visa and Mastercard through our secure payment gateway. Wallet Balance may be used where available. Reward Credits may be used for eligible ticket purchases only, unless stated otherwise.',
      },
      {
        q: 'Is my payment information safe?',
        a: 'Payments are processed through a secure payment gateway. BigAuction.ae does not store your card details on its own servers.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'There are no hidden buyer premiums unless clearly stated on the item page. Any applicable delivery charges, taxes, or additional service charges will be displayed before checkout or communicated before payment is completed.',
      },
      {
        q: 'Will I receive a receipt or invoice?',
        a: 'Yes. After completing payment, you may receive a receipt, invoice, or order confirmation through your registered email or account area.',
      },
    ],
  },
  {
    category: 'Delivery',
    icon: icons.delivery,
    items: [
      {
        q: 'How do I receive my item after winning or using Buy Now?',
        a: 'After winning an auction or completing a Buy Now purchase, BigAuction.ae will arrange delivery of the item to your address in the UAE or GCC. The item will be held in the UAE before delivery and will only be released once payment is completed and confirmed.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Delivery timing depends on the buyer location, payment confirmation, delivery schedule, and any additional verification required before release. UAE delivery typically takes 3-7 business days after payment confirmation. GCC delivery may take longer depending on the destination and delivery requirements.',
      },
      {
        q: 'Is there a delivery charge?',
        a: 'Delivery charges, if applicable, will be displayed at checkout or communicated before delivery is confirmed. Charges may vary between UAE and GCC deliveries depending on the destination and item.',
      },
      {
        q: 'Can I pick up my item in person?',
        a: 'Currently, items are delivered by BigAuction.ae within the UAE and GCC. Pickup may be offered only if specifically confirmed by our team for that item.',
      },
      {
        q: 'What do I need to receive the item?',
        a: 'BigAuction.ae may request identity verification, delivery confirmation, signature, or other reasonable proof before releasing the item to the buyer or authorized recipient.',
      },
    ],
  },
  {
    category: 'Product Details, Condition & Authenticity',
    icon: icons.product,
    items: [
      {
        q: 'What information is shown on each item page?',
        a: 'Each item page may include the item name, brand, model, photos, condition details, included accessories, documents, ticket price, bid increment, maximum bid amount, Buy Now price if available, and auction timing.',
      },
      {
        q: 'What documents come with the item?',
        a: 'Included documents vary by item. Some items may include box, card, certificate, receipt, service papers, or third-party authentication. The exact inclusions will be shown on the item page.',
      },
      {
        q: 'Can I inspect the item before bidding?',
        a: 'BigAuction.ae provides photos, descriptions, and available condition details on the item page. Physical inspection may not be available unless specifically offered for that item.',
      },
      {
        q: 'What if the item condition is not as described?',
        a: 'If you believe the item received is materially different from the description shown on the platform, you should contact BigAuction.ae support immediately after delivery. The matter will be reviewed according to the platform terms and applicable policies.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    icon: icons.account,
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click Create Account or Sign Up and enter the required details such as your name, email address, phone number, and password. Registration is free.',
      },
      {
        q: 'Can I update my profile details?',
        a: 'Yes. You can update your profile details from your account or dashboard area. Some details may require verification before they are changed.',
      },
      {
        q: 'I forgot my password. What should I do?',
        a: 'Click Login and then Forgot Password. Enter your registered email address and follow the instructions to reset your password.',
      },
      {
        q: 'Where can I see my tickets, bids, orders, and wallet?',
        a: 'You can see your auction activity from your Profile or Dashboard, including your tickets, bids, orders, wallet activity, and favourite items where available.',
      },
      {
        q: 'Can I save items I like?',
        a: 'Yes. Logged-in users can add items to their favourites or wishlist, where available, to follow them more easily.',
      },
    ],
  },
  {
    category: 'Support',
    icon: icons.support,
    items: [
      {
        q: 'How can I contact BigAuction.ae?',
        a: 'You can contact BigAuction.ae through the support options shown on the website, including the Help Centre, contact form, email, WhatsApp, or other available support channels.',
      },
      {
        q: 'What should I include when contacting support?',
        a: 'Please include your registered name, phone number or email, auction or item name, order or ticket reference if available, and a clear description of the issue.',
      },
    ],
  },
]

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-taupe/10 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className={`text-sm font-medium transition-colors ${open ? 'text-emerald' : 'text-charcoal group-hover:text-emerald'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
          open ? 'border-emerald bg-emerald text-ivory rotate-45' : 'border-taupe/30 text-taupe group-hover:border-emerald group-hover:text-emerald'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-4 pr-10">
          <p className="text-taupe text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

function CategorySection({ category, icon, items }) {
  return (
    <div id={category.toLowerCase().replace(/\s+/g, '-')} className="bg-white border border-taupe/15 rounded-2xl shadow-luxury overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-taupe/10 bg-ivory/60">
        <div className="w-7 h-7 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
          {icon}
        </div>
        <h2 className="text-charcoal font-semibold text-sm uppercase tracking-wide">{category}</h2>
        <span className="ml-auto text-taupe text-xs">{items.length} questions</span>
      </div>
      <div className="px-6">
        {items.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  )
}

export default function HelpPage() {
  const [search, setSearch] = useState('')

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search.trim() ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0)

  const totalResults = filtered.reduce((n, c) => n + c.items.length, 0)

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-emerald relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #F2E7D5 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold/30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
          <p className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4">Help Centre</p>
          <h1 className="font-display text-ivory text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            How Can We Help?
          </h1>
          <p className="text-ivory/60 text-sm mb-8">Search our FAQs or browse by topic below.</p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full bg-white text-charcoal placeholder-taupe/50 text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/40 shadow-md"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── QUICK NAV ────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-taupe/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
            {FAQS.map(cat => (
              <a
                key={cat.category}
                href={`#${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-taupe hover:text-emerald hover:bg-emerald/5 border border-taupe/20 hover:border-emerald/30 transition-all"
              >
                <span className="text-emerald">{cat.icon}</span>
                {cat.category}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ CONTENT ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        {search && (
          <p className="text-taupe text-sm">
            {totalResults > 0
              ? `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${search}"`
              : `No results for "${search}"`
            }
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-taupe/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-taupe/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
            </div>
            <p className="text-charcoal font-semibold">No results found</p>
            <p className="text-taupe text-sm">Try a different search term or browse the topics above.</p>
            <button onClick={() => setSearch('')} className="text-gold text-sm hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          filtered.map(cat => (
            <CategorySection key={cat.category} category={cat.category} icon={cat.icon} items={cat.items} />
          ))
        )}
      </section>

      {/* ── STILL NEED HELP ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-charcoal rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-ivory text-2xl font-semibold mb-2">Still need help?</h3>
            <p className="text-ivory/50 text-sm leading-relaxed">
              Our team is here for you. Reach out and we'll get back to you as quickly as possible.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="mailto:info@bigauction.ae"
              className="flex items-center gap-2 bg-gold-gradient text-almost-black font-bold px-6 py-3 rounded text-sm hover:opacity-90 transition-opacity uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email Us
            </a>
            <a
              href="https://wa.me/971555800246"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-ivory/20 text-ivory font-semibold px-6 py-3 rounded text-sm hover:border-ivory/40 hover:bg-white/5 transition-colors uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
