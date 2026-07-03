import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAuctions } from '../features/auctions/auctionsSlice'
import { fetchFavourites } from '../features/favourites/favouritesSlice'
import useFavourites from '../hooks/useFavourites'
import HeroBanner from '../components/common/HeroBanner'

// ── Countdown hook ─────────────────────────────────────────────

function useCountdown(target) {
  const calc = () => {
    const diff = target ? new Date(target) - Date.now() : 0
    if (diff <= 0) return { dd: 0, hh: 0, mm: 0, ss: 0 }
    return {
      dd: Math.floor(diff / 86400000),
      hh: Math.floor((diff % 86400000) / 3600000),
      mm: Math.floor((diff % 3600000) / 60000),
      ss: Math.floor((diff % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    if (!target) return
    setT(calc())
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [target])
  return t
}

const pad = n => String(n).padStart(2, '0')

// ── Section header banner ──────────────────────────────────────

function SectionBanner({ title, subtitle, leftImage, rightImage }) {
  return (
    <div className="relative bg-emerald overflow-hidden">
      {/* Side decorations */}
      {leftImage && (
        <div className="absolute left-0 top-0 h-full w-36 overflow-hidden opacity-70">
          <img src={leftImage} alt="" className="w-full h-full object-cover object-right" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald" />
        </div>
      )}
      {rightImage && (
        <div className="absolute right-0 top-0 h-full w-36 overflow-hidden opacity-70">
          <img src={rightImage} alt="" className="w-full h-full object-cover object-left" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-emerald" />
        </div>
      )}

      {/* Center text */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
             backgroundSize: '24px 24px',
           }} />

      <div className="relative z-10 py-9 text-center px-4">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-px w-14 bg-gold/50" />
          <p className="text-gold font-bold text-sm tracking-[0.35em] uppercase">{title}</p>
          <div className="h-px w-14 bg-gold/50" />
        </div>
        <p className="font-display text-ivory text-2xl sm:text-3xl font-semibold">{subtitle}</p>
      </div>
    </div>
  )
}

// ── Carousel wrapper ───────────────────────────────────────────

function Carousel({ children }) {
  const ref = useRef(null)
  const scroll = dir => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-taupe/25 shadow-md flex items-center justify-center text-charcoal hover:border-emerald hover:text-emerald transition-colors"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

// ── Coming Soon card ───────────────────────────────────────────

function ComingSoonCard({ auction, isFavourite, onToggleFavourite }) {
  const navigate = useNavigate()
  const product  = auction.product
  const countdown = useCountdown(auction.scheduledStartTime)
  const image    = product?.imageUrls?.[0] || null
  const brand    = product?.brand || product?.category?.name || 'Luxury'
  const ticketsSold  = auction.ticketsSold  || 0
  const ticketTarget = auction.ticketTarget || 0
  const ticketPct    = ticketTarget > 0 ? Math.min((ticketsSold / ticketTarget) * 100, 100) : 0
  const buyNowPrice  = product?.buyNowPrice ? Number(product.buyNowPrice) : null
  const maxBid       = auction.reservePrice || auction.estimateHigh

  return (
    <div className="flex-shrink-0 w-[330px] sm:w-[390px] bg-white rounded-[22px] overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col border border-gold/20">

      {/* Approved reference stage */}
      <Link to={`/products/${product?.id}`} className="group block relative h-[300px] bg-[#f7efe4] overflow-hidden flex-shrink-0">
        <div className="absolute inset-3 rounded-[18px] border border-gold/25 bg-[#fbf4ea] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(198,169,114,0.18),transparent_24%),linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.25)_52%,rgba(255,255,255,0.82))]" />

          <div className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-lg bg-emerald px-4 py-3 shadow-md">
            <svg className="h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 5.25h13.5c.828 0 1.5.672 1.5 1.5v12c0 .828-.672 1.5-1.5 1.5H5.25c-.828 0-1.5-.672-1.5-1.5v-12c0-.828.672-1.5 1.5-1.5z" />
            </svg>
            <span className="text-ivory text-sm font-bold tracking-wide uppercase">Auctions Starting Soon</span>
          </div>

          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavourite?.(auction.id) }}
            className={`absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md border border-gold/20 transition-colors ${isFavourite ? 'text-burgundy' : 'text-gold hover:text-emerald'}`}
            aria-label="Toggle favourite"
          >
            <svg className="w-6 h-6" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <div className="absolute left-7 top-[126px] z-10 max-w-[135px]">
            <p className="font-display text-[2.05rem] leading-none tracking-[0.26em] uppercase text-gold/95 break-words">
              {brand}
            </p>
          </div>

          <div className="absolute right-5 bottom-0 h-[220px] w-[66%]">
            {image
              ? <img src={image} alt={product?.name} className="h-full w-full object-contain object-bottom drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.03]" />
              : <div className="h-full w-full flex items-center justify-center text-gold/25 text-6xl">◆</div>
            }
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <Link to={`/products/${product?.id}`}>
          <h3 className="font-display text-charcoal font-semibold text-lg leading-snug line-clamp-2 hover:text-emerald transition-colors">
            {product?.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between rounded-lg border border-taupe/15 bg-ivory px-3 py-2">
          <p className="text-taupe text-[10px] font-bold uppercase tracking-[0.18em]">Starts In</p>
          <div className="flex items-center gap-1.5">
            {[
              ['D', countdown.dd],
              ['H', countdown.hh],
              ['M', countdown.mm],
            ].map(([unit, value]) => (
              <span key={unit} className="inline-flex items-baseline gap-0.5 rounded bg-white px-2 py-1 text-charcoal shadow-sm">
                <strong className="font-mono text-xs">{pad(value)}</strong>
                <span className="text-[8px] text-taupe">{unit}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Pricing table */}
        <div className="space-y-1.5 text-xs">
          {maxBid && (
            <div className="flex items-center justify-between">
              <span className="text-taupe">Max Bid Amount</span>
              <span className="text-charcoal font-semibold">AED {Number(maxBid).toLocaleString()}</span>
            </div>
          )}
          {buyNowPrice && (
            <div className="flex items-center justify-between">
              <span className="text-taupe">Buy Now Price</span>
              <span className="text-charcoal font-semibold">AED {buyNowPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-taupe">Ticket Price</span>
            <span className="text-charcoal font-semibold">AED {Number(auction.ticketPrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-taupe">Tickets Sold</span>
            <span className="text-charcoal font-semibold">{ticketsSold.toLocaleString()} / {ticketTarget.toLocaleString()}</span>
          </div>
          <div className="w-full h-1 bg-taupe/15 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${ticketPct}%` }} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={() => navigate(`/products/${product?.id}`, { state: { autoTicket: true } })}
            className="flex-1 flex items-center justify-center gap-1.5 border border-emerald text-emerald text-xs font-bold py-2.5 rounded hover:bg-emerald hover:text-ivory transition-colors uppercase tracking-wide"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
            Buy Ticket
          </button>
          {buyNowPrice ? (
            <button
              onClick={() => navigate('/checkout', { state: { type: 'buynow', product, auction } })}
              className="flex-1 bg-gold-gradient text-charcoal text-xs font-bold py-2.5 rounded hover:opacity-90 transition-opacity uppercase tracking-wide"
            >
              Buy Now
            </button>
          ) : (
            <div className="flex-1 bg-taupe/10 text-taupe/60 text-xs font-bold py-2.5 rounded text-center cursor-not-allowed uppercase tracking-wide">
              Buy Now
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Live Auction card ──────────────────────────────────────────

function LiveAuctionCard({ auction, isFavourite, onToggleFavourite }) {
  const product   = auction.product
  const countdown = useCountdown(auction.scheduledEndTime)
  const image     = product?.imageUrls?.[0] || null
  const highest   = Number(auction.currentHighestBid || 0)
  const maxBid    = auction.reservePrice || auction.estimateHigh

  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] bg-white rounded-xl overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col">

      {/* Top bar: LIVE + countdown + heart */}
      <div className="flex items-center justify-between bg-emerald px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ivory opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ivory" />
            </span>
            <span className="text-ivory text-[10px] font-bold uppercase tracking-wide">Live</span>
          </div>
          <p className="text-ivory text-[11px] font-bold font-mono">
            {pad(countdown.hh)}h : {pad(countdown.mm)}m : {pad(countdown.ss)}s
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleFavourite?.(auction.id) }}
          className={`transition-colors ${isFavourite ? 'text-burgundy' : 'text-ivory/50 hover:text-ivory'}`}
        >
          <svg className="w-4 h-4" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <Link to={`/products/${product?.id}`} className="block relative h-44 bg-ivory overflow-hidden flex-shrink-0">
        {image
          ? <img src={image} alt={product?.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-taupe/20 text-4xl">◆</div>
        }
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <Link to={`/products/${product?.id}`}>
          <h3 className="text-charcoal font-semibold text-sm leading-snug line-clamp-2 hover:text-emerald transition-colors">
            {product?.name}
          </h3>
        </Link>

        {/* Stats */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-taupe">Highest Bid</span>
            <span className="text-gold font-bold">
              {highest > 0 ? `AED ${highest.toLocaleString()}` : '—'}
            </span>
          </div>
          {maxBid && (
            <div className="flex items-center justify-between">
              <span className="text-taupe">Max Bid Amount</span>
              <span className="text-charcoal font-semibold">AED {Number(maxBid).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-taupe">Total Bids</span>
            <span className="text-charcoal font-semibold">{auction.bidCount || 0}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/products/${product?.id}`}
          className="mt-auto block w-full bg-emerald text-ivory text-xs font-bold py-2.5 rounded text-center hover:bg-emerald/90 transition-colors uppercase tracking-wide"
        >
          View Auction
        </Link>
      </div>
    </div>
  )
}

// ── Recent Winner card ─────────────────────────────────────────

function WinnerCard({ auction }) {
  const product = auction.product
  const image   = product?.imageUrls?.[0] || null
  const date    = auction.endTime
    ? new Date(auction.endTime).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const winnerDisplay = auction.winnerName
    ? auction.winnerName.split(' ')[0] + (auction.winnerName.split(' ')[1] ? ' ' + auction.winnerName.split(' ')[1][0] + '.' : '')
    : '—'

  return (
    <div className="flex-shrink-0 w-[260px] sm:w-[280px] bg-white rounded-lg overflow-hidden shadow-luxury flex gap-0 flex-col border border-gold/15">
      <div className="relative h-40 bg-ivory overflow-hidden flex-shrink-0">
        {image
          ? <img src={image} alt={product?.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-taupe/20 text-4xl">◆</div>
        }
        <div className="absolute top-2 left-2 bg-emerald text-ivory text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide">
          Auction Result
        </div>
      </div>
      <div className="p-3 space-y-1.5 text-xs">
        <p className="font-display text-charcoal font-semibold text-base leading-snug line-clamp-2">{product?.name}</p>
        <div className="flex justify-between">
          <span className="text-taupe">Winner</span>
          <span className="text-charcoal font-medium">{winnerDisplay}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-taupe">Final Amount</span>
          <span className="text-charcoal font-semibold">AED {Number(auction.currentHighestBid || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-taupe">Completed On</span>
          <span className="text-charcoal font-medium">{date}</span>
        </div>
      </div>
    </div>
  )
}

// ── How It Works data ──────────────────────────────────────────

const HOW_STEPS = [
  {
    num: 1,
    title: 'Browse Auctions',
    text: 'Discover premium items for free.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Buy a Ticket',
    text: 'Get your ticket and join the auction.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Join & Compete',
    text: 'Participate live and place your offers.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M8.25 21V9m0 0L4.5 5.25M8.25 9l3.75-3.75m3.75 15V9m0 0l3.75-3.75M15.75 9l-3.75-3.75" />
      </svg>
    ),
  },
  {
    num: 4,
    title: 'Win or Buy',
    text: 'Win the auction or use Instant Buy.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    num: 5,
    title: 'We Deliver',
    text: 'Secure payment and fast delivery.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
]

// ── Main component ─────────────────────────────────────────────

export default function HomePage() {
  const dispatch = useDispatch()
  const { items: auctions } = useSelector(s => s.auctions)
  const { user } = useSelector(s => s.auth)
  const { isFavourite, toggle: toggleFavourite } = useFavourites()

  useEffect(() => {
    dispatch(fetchAuctions())
    if (user) dispatch(fetchFavourites())
  }, [])

  const pendingAuctions = auctions.filter(a => a.status === 'PENDING')
  const liveAuctions    = auctions.filter(a => a.status === 'ACTIVE')
  const recentWinners   = auctions.filter(a =>
    (a.status === 'SOLD' || a.status === 'CLOSED') && a.winnerName
  ).slice(0, 8)

  // Pick decoration images from auction items
  const pendingImages = pendingAuctions.flatMap(a => a.product?.imageUrls || []).filter(Boolean)
  const liveImages    = liveAuctions.flatMap(a => a.product?.imageUrls || []).filter(Boolean)

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── COMING SOON ──────────────────────────────────────── */}
      {pendingAuctions.length > 0 && (
        <section>
          <SectionBanner
            title="Auctions Starting Soon"
            subtitle="Secure your spot before the auction begins"
            leftImage={pendingImages[0]}
            rightImage={pendingImages[1]}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 overflow-hidden">
            <Carousel>
              {pendingAuctions.map(a => (
                <ComingSoonCard
                  key={a.id}
                  auction={a}
                  isFavourite={isFavourite(a.product?.id)}
                  onToggleFavourite={() => toggleFavourite(a.product?.id)}
                />
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* ── LIVE AUCTIONS ─────────────────────────────────────── */}
      {liveAuctions.length > 0 && (
        <section>
          <SectionBanner
            title="Live Auctions"
            subtitle="Place your bids and compete in real-time"
            leftImage={liveImages[0]}
            rightImage={liveImages[1]}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 overflow-hidden">
            <Carousel>
              {liveAuctions.map(a => (
                <LiveAuctionCard
                  key={a.id}
                  auction={a}
                  isFavourite={isFavourite(a.product?.id)}
                  onToggleFavourite={() => toggleFavourite(a.product?.id)}
                />
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* ── RECENT WINNERS ───────────────────────────────────── */}
      {recentWinners.length > 0 && (
        <section id="winners">
          <SectionBanner
            title="Auction Results"
            subtitle="Real results. Real excitement"
            leftImage={liveImages[0] || pendingImages[0]}
            rightImage={liveImages[1] || pendingImages[1]}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 overflow-hidden">
            <Carousel>
              {recentWinners.map(a => (
                <WinnerCard key={a.id} auction={a} />
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-y border-taupe/10">
        <SectionBanner
          title="How Big Auction Works"
          subtitle="Simple steps to join, bid, and win"
          leftImage={pendingImages[2] || liveImages[0]}
          rightImage={liveImages[2] || pendingImages[1]}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Steps */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-0">
                {HOW_STEPS.map((step, i) => (
                  <div key={step.num} className="flex sm:flex-col items-center sm:items-center flex-1 gap-3 sm:gap-0 sm:text-center">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gold/30 bg-ivory flex items-center justify-center">
                      {step.icon}
                    </div>
                    {/* Connector arrow (between steps, horizontal on sm+) */}
                    {i < HOW_STEPS.length - 1 && (
                      <div className="hidden sm:flex flex-1 items-center justify-center -mx-2 mt-[-32px] z-0">
                        <svg className="w-5 h-5 text-gold/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    )}
                    <div className="sm:mt-3 pb-2">
                      <p className="text-charcoal text-sm font-bold">{step.num}. {step.title}</p>
                      <p className="text-taupe text-xs mt-1 max-w-[130px] mx-auto leading-snug">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New to auctions CTA */}
            <div className="flex-shrink-0 lg:w-56 bg-ivory border border-taupe/20 rounded-2xl p-6 text-center">
              <p className="text-charcoal font-semibold text-sm mb-1">New to auctions?</p>
              <p className="text-taupe text-xs mb-4 leading-relaxed">Learn how it works in just 2 minutes.</p>
              <a
                href="/#how-it-works"
                className="inline-flex items-center gap-2 bg-charcoal text-ivory text-xs font-bold px-5 py-2.5 rounded hover:bg-emerald transition-colors uppercase tracking-wide"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-ivory/40">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                    <polygon points="3,1 9,5 3,9" />
                  </svg>
                </span>
                Watch Video
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────── */}
      <section className="bg-emerald">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-ivory font-bold text-base">Never miss an exclusive deal</p>
                <p className="text-ivory/60 text-xs mt-0.5">Subscribe to get notified about new auctions, special items and more.</p>
              </div>
            </div>
            <form
              onSubmit={e => e.preventDefault()}
              className="flex w-full sm:w-auto gap-0 rounded overflow-hidden border border-white/20 flex-shrink-0"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 bg-white/10 text-ivory placeholder-ivory/40 text-sm px-4 py-3 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gold text-almost-black text-xs font-bold px-6 py-3 hover:bg-gold/90 transition-colors uppercase tracking-wide whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  )
}
