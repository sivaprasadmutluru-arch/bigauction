import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconHeart({ className, filled }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function IconGavel({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M8.25 21V9m0 0L4.5 5.25M8.25 9l3.75-3.75m3.75 15V9m0 0l3.75-3.75M15.75 9l-3.75-3.75M12 5.25L9.75 3 8.25 4.5 10.5 6.75M12 5.25l2.25-2.25 1.5 1.5L13.5 6.75" />
    </svg>
  )
}

function IconBag({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  )
}

function IconTicket({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  )
}

function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(targetDate) {
  const calc = () => {
    const diff = targetDate ? new Date(targetDate) - new Date() : 0
    if (diff <= 0) return { dd: 0, hh: 0, mm: 0, ss: 0 }
    return {
      dd: Math.floor(diff / 86400000),
      hh: Math.floor((diff % 86400000) / 3600000),
      mm: Math.floor((diff % 3600000) / 60000),
      ss: Math.floor((diff % 60000) / 1000),
    }
  }

  const [time, setTime] = useState(calc)

  useEffect(() => {
    if (!targetDate) return
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return time
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductCard({ product, isFavourite, onToggleFavourite }) {
  const navigate     = useNavigate()
  const auction      = product.auction
  const status       = auction?.status
  const image        = product.imageUrls?.[0] || null
  const buyNowPrice  = product.buyNowPrice ? Number(product.buyNowPrice) : null
  const isActive     = status === 'ACTIVE'
  const isPending    = status === 'PENDING'
  const isClosed     = status === 'CLOSED'
  const isSold       = status === 'SOLD' || product.sold
  const hasAuction   = isActive || isPending

  const currentBid   = Number(auction?.currentHighestBid || 0)
  const ticketsSold  = auction?.ticketsSold  || 0
  const ticketTarget = auction?.ticketTarget || 0
  const ticketPct    = ticketTarget > 0 ? Math.min((ticketsSold / ticketTarget) * 100, 100) : 0
  // `buyNowEnabled` only means the feature was configured by an admin.
  // The API's computed `buyNowAvailable` also applies time/threshold/status rules.
  const buyNowAvail  = !!(buyNowPrice && auction?.buyNowAvailable && isPending)
  const showBuyNow    = isPending && buyNowAvail

  const countdownTarget =
    isActive  ? auction.scheduledEndTime :
    isPending ? auction.scheduledStartTime : null
  const countdown = useCountdown(countdownTarget)
  const pad = n => String(n).padStart(2, '0')

  const badgeLabel    = isActive ? 'Live Auction' : isPending ? 'Upcoming Auction' : isClosed ? 'Auction Ended' : isSold ? 'Sold' : null
  const countdownLabel = isActive ? 'Auction Ends In' : 'Auction Starts In'

  // ── Visibility flags (invisible = hidden but keeps layout space) ──
  // This ensures every card has the exact same height regardless of status.
  const showPricingBoxes = hasAuction || showBuyNow
  const showStats        = hasAuction
  const showCTA          = isPending || isActive
  const showViewDetails  = !isPending && !isActive

  return (
    <div className={`flex flex-col bg-white rounded-xl overflow-hidden border border-taupe/15 shadow-luxury transition-all duration-300 hover:shadow-luxury-hover h-full ${isSold ? 'opacity-60' : ''}`}>

      {/* ── Image — wrapped in Link so clicking it navigates to detail ── */}
      <Link to={`/products/${product.id}`} className="group block relative h-52 flex-shrink-0 bg-ivory overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isSold ? 'grayscale' : 'group-hover:scale-105'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-taupe/20 text-5xl select-none">◆</div>
        )}

        {/* Status badge */}
        {badgeLabel && (
          <div className="absolute top-3 left-3">
            <span className={`flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-md ${
              isActive || isPending ? 'bg-emerald text-ivory' :
              isClosed ? 'bg-taupe text-ivory' :
              'bg-burgundy/70 text-ivory'
            }`}>
              <IconCalendar className="w-3.5 h-3.5 flex-shrink-0" />
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Favourite button — stopPropagation so it doesn't trigger the Link */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavourite?.() }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <IconHeart
            className={`w-[18px] h-[18px] transition-colors ${isFavourite ? 'text-burgundy' : 'text-taupe/60'}`}
            filled={isFavourite}
          />
        </button>

        {/* Brand overlay */}
        {product.brand && (
          <div className="absolute bottom-3 left-4">
            <span className="font-display text-xl italic tracking-widest text-gold drop-shadow-sm">
              {product.brand}
            </span>
          </div>
        )}

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-almost-black/55 flex items-center justify-center">
            <span className="text-ivory font-bold text-xl tracking-[0.25em] uppercase">Sold</span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="px-4 pt-3 pb-3 flex flex-col flex-1 gap-2">

        {/* Title + tagline */}
        <Link to={`/products/${product.id}`} className="group block text-center">
          <h3 className="font-display text-charcoal group-hover:text-gold transition-colors font-semibold text-base leading-snug line-clamp-2" style={{ minHeight: '2.6rem' }}>
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2 my-1.5">
            <div className="flex-1 h-px bg-gold/25" />
            <span className="text-gold text-[9px] leading-none">◆</span>
            <div className="flex-1 h-px bg-gold/25" />
          </div>
          <p className="text-taupe text-xs italic h-4 overflow-hidden leading-none">
            {product.tagline || (product.sourceCountry ? `Sourced from ${product.sourceCountry}` : 'Timeless. Iconic. Effortlessly Elegant.')}
          </p>
        </Link>

        {/* ── Pricing boxes ── */}
        <div className={`grid ${showBuyNow ? 'grid-cols-2' : 'grid-cols-1'} gap-2 ${!showPricingBoxes ? 'invisible pointer-events-none' : ''}`}>

          {/* Max Bid box */}
          <div className={`bg-emerald rounded-lg px-3 py-2.5 flex flex-col items-center gap-1 ${!hasAuction ? 'invisible' : ''}`}>
            <div className="flex items-center gap-1 text-gold/90 text-[9px] font-bold tracking-[0.1em] uppercase text-center leading-tight">
              <IconGavel className="w-3 h-3 flex-shrink-0" />
              Max Bid Amount
            </div>
            <p className="text-ivory text-base font-bold leading-none">
              {currentBid > 0 ? `AED ${currentBid.toLocaleString()}` : '—'}
            </p>
            <span className="text-gold/50 text-[9px] leading-none">◆</span>
          </div>

          {/* Buy Now box */}
          {showBuyNow && (
            <div className="border border-gold/35 rounded-lg px-3 py-2.5 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-taupe text-[9px] font-bold tracking-[0.1em] uppercase text-center leading-tight">
                <IconBag className="w-3 h-3 flex-shrink-0" />
                Buy Now Price
              </div>
              <p className="text-base font-bold leading-none text-gold">
                AED {buyNowPrice.toLocaleString()}
              </p>
              <span className="text-gold/40 text-[9px] leading-none">◆</span>
            </div>
          )}

        </div>

        {/* ── Stats row ── */}
        <div className={`border border-taupe/15 rounded-lg overflow-hidden ${!showStats ? 'invisible' : ''}`}>
          <div className="grid grid-cols-3 divide-x divide-taupe/15">

            {/* Ticket price */}
            <div className="px-2 py-2 flex flex-col items-center gap-1">
              <IconTicket className="w-3.5 h-3.5 text-gold/70" />
              <p className="text-taupe text-[8px] font-semibold tracking-wide uppercase text-center leading-tight">Ticket Price</p>
              <span className="text-gold font-bold text-xs leading-none">AED {Number(auction?.ticketPrice || 0).toLocaleString()}</span>
            </div>

            {/* Tickets sold */}
            <div className="px-2 py-2 flex flex-col items-center gap-1">
              <p className="text-taupe text-[8px] font-semibold tracking-wide uppercase">Tickets Sold</p>
              <p className="text-charcoal font-bold text-xs leading-none">
                {ticketsSold.toLocaleString()} / {ticketTarget.toLocaleString()}
              </p>
              <div className="w-full h-0.5 bg-taupe/20 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${ticketPct}%` }} />
              </div>
              <p className="text-gold text-[9px] font-semibold leading-none">{ticketPct.toFixed(1)}%</p>
            </div>

            {/* Countdown */}
            <div className="px-2 py-2 flex flex-col items-center gap-1">
              <p className="text-taupe text-[8px] font-semibold tracking-wide uppercase text-center leading-tight">{countdownLabel}</p>
              <div className="flex items-center">
                {[[pad(countdown.dd),'DD'],[pad(countdown.hh),'HH'],[pad(countdown.mm),'MM'],[pad(countdown.ss),'SS']].map(([val, unit], i) => (
                  <div key={unit} className="flex items-center">
                    {i > 0 && <span className="text-gold/70 text-[9px] mx-px">:</span>}
                    <div className="flex flex-col items-center">
                      <span className="text-charcoal font-bold text-xs leading-none">{val}</span>
                      <span className="text-taupe/60 text-[7px] leading-none">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-auto flex flex-col gap-2">

          {isPending ? (
            <div className={`flex items-center gap-1.5 ${showBuyNow ? '' : 'grid grid-cols-1'}`}>
              <button
                onClick={() => navigate(`/products/${product.id}`, { state: { autoTicket: true } })}
                className="flex-1 bg-emerald text-ivory rounded-lg py-2.5 px-2 flex flex-col items-center btn-shimmer hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  <IconTicket className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-bold text-[11px] tracking-wide uppercase">Buy Auction Ticket</span>
                </div>
                <span className="text-ivory/60 text-[9px]">Join the auction</span>
              </button>

              {showBuyNow && (
                <>
                  <div className="w-7 h-7 rounded-full border border-taupe/25 bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-taupe text-[8px] font-semibold">OR</span>
                  </div>
                <button
                  onClick={() => navigate('/checkout', { state: { type: 'buynow', product, auction } })}
                  className="flex-1 bg-gold-gradient text-charcoal rounded-lg py-2.5 px-2 flex flex-col items-center btn-shimmer hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-1">
                    <IconBag className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-bold text-[11px] tracking-wide uppercase">Buy Now</span>
                  </div>
                  <span className="text-charcoal/55 text-[9px]">Get it instantly</span>
                </button>
                </>
              )}
            </div>
          ) : isActive ? (
            <Link
              to={`/products/${product.id}`}
              className="w-full bg-emerald text-ivory rounded-lg py-2.5 text-center font-bold text-xs tracking-wider uppercase btn-shimmer hover:opacity-90 transition-opacity"
            >
              Join Live Auction
            </Link>
          ) : showViewDetails ? (
            <Link
              to={`/products/${product.id}`}
              className="w-full bg-gold-gradient text-charcoal rounded-lg py-2.5 text-center font-bold text-xs tracking-wider uppercase btn-shimmer hover:opacity-90 transition-opacity"
            >
              {isClosed || isSold ? 'View Result' : 'View Details'}
            </Link>
          ) : null}

          {/* Footer */}
          <div className="flex items-center justify-center gap-1 text-taupe/40 text-[10px]">
            <IconShield className="w-3 h-3 flex-shrink-0" />
            Secure. Transparent. Trusted.
          </div>

        </div>

      </div>
    </div>
  )
}
