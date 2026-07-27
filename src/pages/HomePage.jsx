import { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAuctions } from '../features/auctions/auctionsSlice'
import { fetchFavourites } from '../features/favourites/favouritesSlice'
import useFavourites from '../hooks/useFavourites'
import api from '../services/api'
import HeroBanner from '../components/common/HeroBanner'
import liveAuctionBannerImage from '../assets/live-auction-gavel-v2-crop.png'
import liveAuctionWatchImage from '../assets/liveauctionwatch.jpeg'
import startingSoonBagImage from '../assets/auction-starting-soon-brown-bag-rich.png'
import startingSoonBangleImage from '../assets/auction-starting-soon-gold-bangle-rich.png'
import newAuctionsImage from '../assets/how-it-works-new-auctions-bag.png'

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
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')
const HOW_IT_WORKS_VIDEO_URL = 'https://www.youtube.com/embed/HV3mKhUAG_U?autoplay=1&rel=0'

const resolveImageUrl = url => {
  if (!url) return null
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

const formatAED = value => {
  if (value === null || value === undefined || value === '') return 'TBA'
  return `AED ${Number(value).toLocaleString()}`
}

const formatTimeline = value => value
  ? new Date(value).toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short' })
  : 'Announcing soon'

function HowItWorksVideoModal({ onClose }) {
  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-almost-black/85 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Watch how Big Auction works"
      onClick={event => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-charcoal shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <p className="font-display text-base font-semibold text-ivory sm:text-lg">Watch How It Works</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-white/10 hover:text-ivory"
            aria-label="Close video"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            className="h-full w-full"
            src={HOW_IT_WORKS_VIDEO_URL}
            title="Big Auction how it works video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

// ── Section header banner ──────────────────────────────────────

function SectionBanner({ title, subtitle, leftImage, rightImage, centerIcon, iconPosition = 'bottom' }) {
  const iconDivider = centerIcon && (
    <div className="mx-auto flex w-44 sm:w-56 items-center justify-center gap-2 text-gold/55">
      <span className="h-px flex-1 bg-gold/35" />
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/45 bg-emerald/70 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
        {typeof centerIcon === 'string' ? (
          <img src={centerIcon} alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
        ) : (
          centerIcon
        )}
      </span>
      <span className="h-px flex-1 bg-gold/35" />
    </div>
  )

  return (
    <div className="relative bg-emerald overflow-hidden min-h-[112px]">
      {/* Side decorations */}
      {leftImage && (
        <div className="hidden sm:block absolute inset-y-0 left-0 w-[34%] lg:w-[31%] pointer-events-none">
          <img
            src={leftImage}
            alt=""
            className="absolute left-0 bottom-0 h-full w-auto max-w-none object-contain opacity-95"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 58%, transparent 100%)',
              maskImage: 'linear-gradient(to right, #000 0%, #000 58%, transparent 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald/0 via-emerald/10 to-emerald" />
          <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-emerald to-transparent" />
        </div>
      )}
      {rightImage && (
        <div className="hidden sm:block absolute inset-y-0 right-0 w-[34%] lg:w-[31%] pointer-events-none">
          <img
            src={rightImage}
            alt=""
            className="absolute right-0 top-1/2 h-[125%] w-auto max-w-none -translate-y-1/2 object-contain opacity-95"
            style={{
              WebkitMaskImage: 'linear-gradient(to left, #000 0%, #000 58%, transparent 100%)',
              maskImage: 'linear-gradient(to left, #000 0%, #000 58%, transparent 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-emerald/5 via-emerald/12 to-emerald" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald to-transparent" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,166,93,0.10),transparent_42%)] pointer-events-none" />

      {/* Center text */}
      <div className="relative z-10 py-8 sm:py-9 text-center">
        {iconPosition === 'top' && centerIcon && <div className="mb-3">{iconDivider}</div>}
        <h2
          className="text-gold text-2xl sm:text-[32px] font-bold uppercase leading-tight"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          {title}
        </h2>
        <p className="text-ivory text-sm sm:text-base mt-1.5">{subtitle}</p>
        {iconPosition === 'bottom' && centerIcon && <div className="mt-3">{iconDivider}</div>}
      </div>
    </div>
  )
}

// ── Carousel wrapper ───────────────────────────────────────────

function Carousel({ children }) {
  return (
    <div
      className="flex gap-5 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory pb-3"
      style={{ scrollbarWidth: 'thin' }}
    >
      {children}
    </div>
  )
}

// ── Coming Soon card ───────────────────────────────────────────

function ComingSoonCard({ auction, isFavourite, onToggleFavourite }) {
  const navigate = useNavigate()
  const product  = auction.product
  const countdown = useCountdown(auction.scheduledStartTime)
  const image    = resolveImageUrl(product?.imageUrls?.[0])
  const [imageFailed, setImageFailed] = useState(false)
  const ticketsSold  = auction.ticketsSold  || 0
  const ticketTarget = auction.ticketTarget || 0
  const ticketPct    = ticketTarget > 0 ? Math.min((ticketsSold / ticketTarget) * 100, 100) : 0
  const buyNowPrice  = product?.buyNowPrice ? Number(product.buyNowPrice) : null
  const maxBid       = auction.maxBidAmount || auction.reservePrice || auction.estimateHigh

  useEffect(() => {
    setImageFailed(false)
  }, [image])

  return (
    <div className="flex-shrink-0 w-[370px] sm:w-[460px] bg-[#fffaf1] border border-[#dcc89f] rounded-lg overflow-hidden shadow-[0_18px_48px_rgba(47,36,20,0.18)] hover:shadow-[0_24px_60px_rgba(47,36,20,0.22)] transition-all duration-300 flex flex-col">

      {/* Premium image hero */}
      <Link to={`/products/${product?.id}`} className="block relative h-56 sm:h-60 bg-[#f7efe3] overflow-hidden flex-shrink-0">
        {image && !imageFailed ? (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            onError={() => setImageFailed(true)}
            onLoad={e => {
              if (image && e.currentTarget.naturalWidth === 0) setImageFailed(true)
            }}
            className="relative z-10 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-taupe/20 text-4xl">◆</div>
        )}
        <div className="absolute left-3 top-3 z-20 rounded-md bg-emerald px-3 py-2 shadow-md border border-gold/35">
          <p className="text-ivory/75 text-[8px] font-bold uppercase tracking-[0.14em]">Auction starts soon</p>
          <p className="text-ivory text-[11px] font-bold font-mono mt-0.5">
            {pad(countdown.dd)}d : {pad(countdown.hh)}h : {pad(countdown.mm)}m
          </p>
        </div>
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavourite?.(auction.id) }}
          className={`absolute right-3 top-3 z-20 w-9 h-9 rounded-full border border-gold/30 bg-white/95 shadow-md flex items-center justify-center transition-colors ${isFavourite ? 'text-burgundy' : 'text-gold hover:text-emerald'}`}
          aria-label="Toggle favourite"
        >
          <svg className="w-4 h-4" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </Link>

      {/* Body */}
      <div className="px-4 sm:px-5 pt-2.5 pb-4 flex flex-col flex-1 gap-2">
        <Link to={`/products/${product?.id}`}>
          <h3 className="font-display text-center text-charcoal font-semibold text-lg sm:text-[21px] leading-[1.05] line-clamp-2 hover:text-emerald transition-colors">
            {product?.name}
          </h3>
        </Link>
        <div className="flex items-center justify-center gap-2 text-gold/70 -mt-1.5 leading-none"><span className="h-px w-14 bg-gold/30" />◆<span className="h-px w-14 bg-gold/30" /></div>
        <p className="text-center text-[10px] text-taupe -mt-2 leading-tight">
          Timeline: {formatTimeline(auction.scheduledStartTime)}. Effortlessly elegant.
        </p>

        {/* Pricing table */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-md bg-emerald px-3 py-2 text-ivory border border-gold/35 shadow-sm">
            <p className="flex items-center justify-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.49-.86l1.405-.84a.994.994 0 011.02 0l1.405.84c.304.184.49.505.49.86v1.68c0 .355-.186.676-.49.86l-1.405.84a.994.994 0 01-1.02 0l-1.405-.84a.997.997 0 01-.49-.86v-1.68zM5.25 13.337c0-.355.186-.676.49-.86l1.405-.84a.994.994 0 011.02 0l1.405.84c.304.184.49.505.49.86v1.68c0 .355-.186.676-.49.86l-1.405.84a.994.994 0 01-1.02 0l-1.405-.84a.997.997 0 01-.49-.86v-1.68z" />
              </svg>
              Maximum Bid Amount
            </p>
            <p className="font-display mt-1 leading-none whitespace-nowrap text-center text-[24px] sm:text-[28px] font-medium tracking-normal">
              {maxBid ? `AED ${Number(maxBid).toLocaleString()}` : 'TBA'}
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-1.5 text-gold/80"><span className="h-px w-8 bg-gold/45" />◆<span className="h-px w-8 bg-gold/45" /></div>
          </div>
          <div className="rounded-md bg-[#fff9ef] px-3 py-2 border border-[#dec798] shadow-sm">
            <p className="flex items-center justify-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              Buy Now Price
            </p>
            <p className="font-display mt-1 leading-none whitespace-nowrap text-center text-[24px] sm:text-[28px] text-[#b77a2a] font-medium tracking-normal">
              {buyNowPrice ? `AED ${buyNowPrice.toLocaleString()}` : 'TBA'}
            </p>
            <div className="mt-1.5 flex items-center justify-center gap-1.5 text-gold/80"><span className="h-px w-8 bg-gold/45" />◆<span className="h-px w-8 bg-gold/45" /></div>
          </div>
        </div>
        <div className="rounded-md border border-[#dec798] bg-[#fff9ef] px-3 py-2.5 text-xs shadow-sm">
          <div className="grid grid-cols-[1.1fr_1.25fr_0.62fr_1.95fr] divide-x divide-gold/25 text-center items-center">
            <div className="px-1.5">
              <svg className="w-5 h-5 mx-auto text-gold" fill="none" stroke="currentColor" strokeWidth="1.35" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v.75m0 3v.75m0 3v.75m0 3v.75M6.75 7.5h5.25M6.75 12h3.75m-7.125-6.75A1.125 1.125 0 004.5 6.375v3.026a3 3 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
              <p className="text-taupe text-[7px] uppercase leading-tight mt-0.5 whitespace-nowrap">Auction Ticket Price</p>
              <p className="font-semibold text-charcoal text-[12px] leading-tight whitespace-nowrap">AED {Number(auction.ticketPrice || 0).toLocaleString()}</p>
              <p className="text-[8px] text-gold leading-tight">per ticket</p>
            </div>
            <div className="px-1.5">
              <p className="text-taupe text-[7px] uppercase leading-tight whitespace-nowrap">Tickets Sold</p>
              <p className="font-semibold text-charcoal mt-1 text-[12px] whitespace-nowrap">{ticketsSold.toLocaleString()} / {ticketTarget.toLocaleString()}</p>
              <div className="mt-2 mx-auto h-1 w-24 rounded-full bg-taupe/15 overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${ticketPct}%` }} />
              </div>
            </div>
            <div className="px-1.5">
              <p className="text-gold font-semibold text-[12px]">{ticketPct.toFixed(1)}%</p>
              <p className="text-taupe text-[8px] uppercase leading-tight">Sold</p>
            </div>
            <div className="px-1.5">
              <p className="text-taupe text-[7px] uppercase leading-tight whitespace-nowrap">Auction Starts In</p>
              <p className="font-mono font-semibold text-charcoal mt-1 text-[11px] sm:text-[12px] whitespace-nowrap leading-tight tracking-normal">{pad(countdown.dd)}:{pad(countdown.hh)}:{pad(countdown.mm)}:{pad(countdown.ss)}</p>
              <p className="font-mono text-[6px] sm:text-[7px] uppercase text-taupe/70 tracking-[0.2em] whitespace-nowrap">DD&nbsp;HH&nbsp;MM&nbsp;SS</p>
            </div>
          </div>
        </div>

        <p className="rounded-md bg-[#f8eddc] py-1.5 text-center text-[9px] text-taupe flex items-center justify-center gap-1.5 border border-[#ead9b8]">
          <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.954 8.955a1.5 1.5 0 01-2.122 0L3.75 11.03m16.5-3.53h-5.25m5.25 0v5.25" />
          </svg>
          Buy Now is available until 50% of tickets are sold.
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)] items-center gap-1.5 mt-auto pt-0.5">
          <button
            onClick={() => navigate(`/products/${product?.id}`, { state: { autoTicket: true } })}
            className="flex min-h-[58px] min-w-0 items-center justify-center gap-2 bg-emerald text-ivory px-2 py-3 rounded-md hover:bg-emerald/90 transition-colors"
          >
            <svg className="w-6 h-6 flex-shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.45" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
            <span className="min-w-0 leading-tight text-left"><span className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-normal whitespace-nowrap">Buy Auction Ticket</span><span className="block text-[8px] sm:text-[9px] font-normal normal-case text-ivory/80 whitespace-nowrap">Join the live auction</span></span>
          </button>
          <span className="w-[22px] h-[22px] rounded-full bg-white border border-gold/35 text-[8px] text-gold flex items-center justify-center shadow-sm">OR</span>
          {buyNowPrice ? (
            <button
              onClick={() => navigate('/checkout', { state: { type: 'buynow', product, auction } })}
              className="min-h-[58px] min-w-0 flex items-center justify-center gap-2 bg-gold-gradient text-charcoal px-2 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.45" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <span className="leading-tight text-left"><span className="block text-[13px] font-bold uppercase tracking-wide">Buy Now</span><span className="block text-[9px] font-normal normal-case text-charcoal/70">Get it instantly</span></span>
            </button>
          ) : (
            <div className="min-h-[58px] flex items-center justify-center gap-3 bg-taupe/10 text-taupe/60 py-3 rounded-md text-center cursor-not-allowed">
              <span className="leading-tight"><span className="block text-[13px] font-bold uppercase tracking-wide">Buy Now</span><span className="block text-[9px] font-normal normal-case">Unavailable</span></span>
            </div>
          )}
        </div>
        <p className="text-center text-[9px] text-taupe flex items-center justify-center gap-1">
          <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.75h-.152A11.959 11.959 0 0112 2.714z" />
          </svg>
          Secure. Transparent. Trusted.
        </p>
      </div>
    </div>
  )
}

// ── Live Auction card ──────────────────────────────────────────

function LiveAuctionCard({ auction, isFavourite, onToggleFavourite }) {
  const product   = auction.product
  const countdown = useCountdown(auction.scheduledEndTime)
  const image     = resolveImageUrl(product?.imageUrls?.[0])
  const highest   = Number(auction.currentHighestBid || 0)
  const maxBid    = auction.reservePrice || auction.estimateHigh
  const ticketsSold  = Number(auction.ticketsSold || 0)
  const ticketTarget = Number(auction.ticketTarget || 0)
  const ticketStatus = ticketTarget > 0
    ? `${ticketsSold.toLocaleString()} / ${ticketTarget.toLocaleString()} tickets`
    : 'Tickets available'

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
          ? <img src={image} alt={product?.name} className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500" />
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
            <span className="text-taupe">Highest Offer Now</span>
            <span className="text-gold font-bold">
              {highest > 0 ? `AED ${highest.toLocaleString()}` : 'No offers yet'}
            </span>
          </div>
          {maxBid && (
            <div className="flex items-center justify-between">
              <span className="text-taupe">Maximum Bid Amount</span>
              <span className="text-charcoal font-semibold">AED {Number(maxBid).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-taupe">Ticket Price</span>
            <span className="text-charcoal font-semibold">AED {Number(auction.ticketPrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-taupe">Ticket Status</span>
            <span className="text-charcoal font-semibold">{ticketStatus}</span>
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

function WinnerCard({ auction, myOrders = [] }) {
  const { user } = useSelector(s => s.auth)
  const product = auction.product
  const image   = resolveImageUrl(product?.imageUrls?.[0])
  const [imgFailed, setImgFailed] = useState(false)
  const isWinner = !!(user && auction.winnerId === user.id)
  const myOrder = isWinner
    ? myOrders.find(o => o.auctionId === auction.id && o.type === 'AUCTION_WIN')
    : null
  const date    = auction.endTime
    ? new Date(auction.endTime).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const winnerDisplay = auction.winnerName
    ? auction.winnerName.split(' ')[0] + (auction.winnerName.split(' ')[1] ? ' ' + auction.winnerName.split(' ')[1][0] + '.' : '')
    : '—'

  return (
    <Link
      to={`/products/${product?.id}`}
      className={`bg-[#fffaf1] border rounded-lg overflow-hidden shadow-[0_10px_28px_rgba(47,36,20,0.12)] flex flex-col hover:shadow-[0_14px_34px_rgba(47,36,20,0.18)] transition-shadow ${isWinner ? 'border-gold ring-2 ring-gold/40' : 'border-[#dcc89f]'}`}
    >
      <div className="relative h-56 bg-[#f7efe3] overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.86),rgba(247,239,227,0.72)_58%,rgba(224,204,170,0.28))]" />
        {image && !imgFailed ? (
          <img
            src={image}
            alt=""
            className="relative z-10 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            onLoad={e => {
              if (image && e.currentTarget.naturalWidth === 0) setImgFailed(true)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-taupe/20 text-4xl">◆</div>
        )}
        {isWinner && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gold-gradient text-almost-black text-[11px] font-bold text-center py-1.5 uppercase tracking-wide shadow-sm">
            {myOrder?.status === 'DELIVERED' ? '📦 Delivered' : myOrder?.status === 'CANCELLED' ? 'Order Cancelled' : '🏆 You Won This Auction!'}
          </div>
        )}
        <div className={`absolute left-3 z-20 flex items-center gap-1 bg-emerald text-ivory text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-gold/40 shadow-sm ${isWinner ? 'top-11' : 'top-3'}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Sold
        </div>
      </div>
      <div className="p-4 space-y-3 text-xs text-center flex flex-col flex-1">
        <p className="font-display text-charcoal font-semibold text-lg leading-tight line-clamp-2">{product?.name}</p>
        <div className="flex items-center justify-center gap-2 text-gold/70 -mt-1"><span className="h-px w-12 bg-gold/30" />◆<span className="h-px w-12 bg-gold/30" /></div>
        {isWinner ? (
          myOrder?.status === 'DELIVERED' ? (
            <div className="rounded-lg border border-emerald bg-emerald/10 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-emerald text-[11px] font-bold uppercase tracking-wide">📦 Delivered</span>
            </div>
          ) : myOrder?.status === 'CANCELLED' ? (
            <div className="rounded-lg border border-burgundy bg-burgundy/10 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-burgundy text-[11px] font-bold uppercase tracking-wide">Cancelled — Refunded</span>
            </div>
          ) : myOrder ? (
            <div className="rounded-lg border border-emerald bg-emerald/10 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-emerald text-[11px] font-bold uppercase tracking-wide">✓ Payment Completed</span>
            </div>
          ) : (
            <div className="rounded-lg border border-gold bg-gold/10 px-3 py-2 flex items-center justify-center gap-1.5">
              <span className="text-gold text-sm">⚠</span>
              <span className="text-charcoal text-[11px] font-bold uppercase tracking-wide">Checkout Pending — Tap to Pay</span>
            </div>
          )
        ) : (
          <p className="text-[10px]"><span className="text-taupe">Winner: </span><span className="text-emerald font-bold tracking-[0.18em] uppercase">{winnerDisplay}</span></p>
        )}
        <div className="rounded-lg border border-[#dec798] bg-[#fff9ef] py-3 px-3 shadow-sm">
          <p className="text-emerald text-[9px] font-bold uppercase tracking-wider">Final Amount</p>
          <p className="font-display text-[#b77a2a] text-[28px] font-medium leading-none mt-1 whitespace-nowrap">AED {Number(auction.currentHighestBid || 0).toLocaleString()}</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-gold/80"><span className="h-px w-8 bg-gold/45" />◆<span className="h-px w-8 bg-gold/45" /></div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gold/20 rounded-lg border border-gold/20 bg-[#fff8eb] py-2 mt-auto">
          <div className="px-2"><p className="text-taupe text-[8px] uppercase">Tickets Sold</p><p className="text-charcoal font-semibold mt-1">{Number(auction.ticketsSold || 0).toLocaleString()} / {Number(auction.ticketTarget || 0).toLocaleString()}</p></div>
          <div className="px-2"><p className="text-taupe text-[8px] uppercase">Completed On</p><p className="text-charcoal font-semibold mt-1">{date}</p></div>
        </div>
      </div>
    </Link>
  )
}

// ── How It Works data ──────────────────────────────────────────

const HOW_STEPS = [
  {
    num: 1,
    title: 'Browse Auctions',
    text: 'Explore upcoming and live auctions featuring luxury watches, handbags, and collector’s pieces.',
    icon: (
      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Buy a Ticket',
    text: 'Choose your auction and secure your ticket. Each ticket gives you a fair chance to win.',
    icon: (
      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Join the Live Auction',
    text: 'When the auction opens, place offers confidently within the published rules.',
    icon: (
      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    num: 4,
    title: 'Win or Buy Now',
    text: 'Win through the live auction or secure an eligible item instantly with Buy Now.',
    icon: (
      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    num: 5,
    title: 'We Deliver',
    text: 'Your item is authenticated, carefully packed, and delivered to your doorstep.',
    icon: (
      <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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
  const [showHowItWorksVideo, setShowHowItWorksVideo] = useState(false)
  const [myOrders, setMyOrders] = useState([])

  useEffect(() => {
    dispatch(fetchAuctions())
    if (user) {
      dispatch(fetchFavourites())
      api.get('/orders').then(res => setMyOrders(res.data || [])).catch(() => {})
    }
  }, [])

  const pendingAuctions = auctions.filter(a => a.status === 'PENDING')
  const liveAuctions    = auctions.filter(a => a.status === 'ACTIVE')
  const recentWinners   = auctions.filter(a =>
    (a.status === 'SOLD' || a.status === 'CLOSED') && a.winnerName
  ).slice(0, 8)

  // Pick decoration images from auction items
  const pendingImages = pendingAuctions.flatMap(a => a.product?.imageUrls || []).map(resolveImageUrl).filter(Boolean)
  const liveImages    = liveAuctions.flatMap(a => a.product?.imageUrls || []).map(resolveImageUrl).filter(Boolean)
  const winnerImages  = recentWinners.flatMap(a => a.product?.imageUrls || []).map(resolveImageUrl).filter(Boolean)

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── COMING SOON ──────────────────────────────────────── */}
      {pendingAuctions.length > 0 && (
        <section>
          <SectionBanner
            title="Auctions Starting Soon"
            subtitle="Secure your spot before the auction begins."
            leftImage={startingSoonBagImage}
            rightImage={startingSoonBangleImage}
          />
          <div className="max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6 py-8 overflow-hidden">
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
            subtitle="Place your offers and compete in real-time."
            leftImage={liveAuctionBannerImage}
            rightImage={liveAuctionWatchImage}
            centerIcon={
              <svg className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <g transform="rotate(-40 12 9)">
                  <rect x="7.5" y="3" width="9" height="3.2" rx="1" />
                  <line x1="12" y1="6.2" x2="12" y2="14" />
                </g>
                <rect x="3" y="17" width="9" height="3" rx="1" />
              </svg>
            }
          />
          <div className="max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6 py-8 overflow-hidden">
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
            subtitle="Real winners. Real closing prices. Transparent results."
            centerIcon={
              <svg className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <g transform="rotate(-40 12 9)">
                  <rect x="7.5" y="3" width="9" height="3.2" rx="1" />
                  <line x1="12" y1="6.2" x2="12" y2="14" />
                </g>
                <rect x="3" y="17" width="9" height="3" rx="1" />
              </svg>
            }
            iconPosition="top"
          />
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
            <div className="mb-5 rounded-md bg-[#fff8eb] border border-gold/20 py-2 px-4 text-center text-[10px] text-taupe flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
              <span>Every auction is verified.</span>
              <span>Every result is final.</span>
              <span>Big Auction is committed to trust, fairness and transparency.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentWinners.map(a => (
                <WinnerCard key={a.id} auction={a} myOrders={myOrders} />
              ))}
            </div>
            <p className="mt-4 rounded-md bg-[#fff8eb] border border-gold/20 py-2 text-center text-[10px] text-taupe">Thank you to our community of auction members. Your trust drives every successful result.</p>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#f3e8d6] border-y border-taupe/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-[#faf4ed] rounded-2xl border border-gold/25 shadow-[0_16px_40px_rgba(47,36,20,0.07)] p-4 sm:p-7">

            {/* Banner */}
            <div className="bg-emerald rounded-xl px-6 py-8 sm:py-9 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="h-px w-12 sm:w-24 bg-gold/40" />
                <div className="w-9 h-9 rounded-full border border-gold/50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <g transform="rotate(-40 12 9)">
                      <rect x="7.5" y="3" width="9" height="3.2" rx="1" />
                      <line x1="12" y1="6.2" x2="12" y2="14" />
                    </g>
                    <rect x="3" y="17" width="9" height="3" rx="1" />
                  </svg>
                </div>
                <span className="h-px w-12 sm:w-24 bg-gold/40" />
              </div>
              <h2
                className="text-gold text-2xl sm:text-3xl font-bold uppercase tracking-wide"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                How Big Auction Works
              </h2>
              <p className="text-ivory/85 text-sm mt-2">A simple, trusted process from discovery to delivery.</p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] gap-y-8 sm:gap-y-2 py-10 px-1 sm:px-3">
              {HOW_STEPS.map((step, i) => (
                <Fragment key={step.num}>
                  <div className="flex sm:flex-col items-center sm:items-center flex-1 gap-4 sm:gap-0 sm:text-center">
                    {/* Icon */}
                    <div className="relative flex-shrink-0 w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-emerald shadow-md flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div className="sm:mt-3 pb-2">
                      <p className="text-gold text-lg font-bold" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{step.num}.</p>
                      <p className="text-charcoal text-base font-bold" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{step.title}</p>
                      <div className="mx-auto mt-1.5 flex w-14 items-center justify-center gap-1.5 text-gold/50">
                        <span className="h-px flex-1 bg-gold/40" />
                        <span className="text-gold text-[10px] leading-none flex-shrink-0">◆</span>
                        <span className="h-px flex-1 bg-gold/40" />
                      </div>
                      <p className="text-taupe text-xs mt-1.5 max-w-[150px] mx-auto leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                  {/* Connector arrow between step circles */}
                  {i < HOW_STEPS.length - 1 && (
                    <div className="hidden sm:flex items-center justify-center h-16 sm:h-[68px] px-1">
                      <svg className="w-4 h-4 text-gold/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* New to auctions strip */}
            <div className="bg-[#faf4ed] border border-gold/25 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-[280px] h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#faf4ed] border border-gold/20 shadow-sm">
                <img src={newAuctionsImage} alt="" className="w-full h-full object-cover object-left-center" aria-hidden="true" />
              </div>
              <div className="flex-1 text-center px-2">
                <div className="mb-1.5 flex items-center justify-center gap-1.5 text-gold/55">
                  <span className="h-px w-7 bg-gold/35" />
                  <span className="text-[9px] leading-none">◆</span>
                  <span className="h-px w-7 bg-gold/35" />
                </div>
                <p className="font-display text-charcoal font-semibold text-base leading-tight">New to auctions?</p>
                <p className="text-taupe text-[10px] mt-1.5 leading-snug max-w-[260px] mx-auto">
                  See how Big Auction makes luxury shopping exciting, transparent, and trustworthy.
                </p>
                <p className="text-gold text-[10px] mt-2 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Secure. Transparent. Trusted.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorksVideo(true)}
                className="inline-flex items-center gap-2 bg-emerald text-ivory text-xs font-bold px-6 py-3 rounded-full hover:bg-charcoal transition-colors uppercase tracking-wide flex-shrink-0"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold text-almost-black">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                    <polygon points="3,1 9,5 3,9" />
                  </svg>
                </span>
                Watch How It Works
              </button>
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

      {showHowItWorksVideo && (
        <HowItWorksVideoModal onClose={() => setShowHowItWorksVideo(false)} />
      )}

    </div>
  )
}
