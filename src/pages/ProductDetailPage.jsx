import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearSelected } from '../features/products/productsSlice'
import {
  fetchBids, fetchAuctionById, placeBid, purchaseTicket,
  clearSelected as clearAuction, checkMyTicket,
  setupAutoBid, getAutoBid, disableAutoBid,
} from '../features/auctions/auctionsSlice'
import { fetchWallet } from '../features/wallet/walletSlice'
import useWebSocket from '../hooks/useWebSocket'
import Loader from '../components/common/Loader'

// ── Constants ────────────────────────────────────────────────────────
const GRADE_LABEL = { LIKE_NEW: 'Like New', EXCELLENT: 'Excellent', VERY_GOOD: 'Very Good', GOOD: 'Good', FAIR: 'Fair' }
const AUTH_COLOR  = {
  AUTHENTICATED: 'text-emerald border-emerald/30 bg-emerald/10',
  PENDING:       'text-gold border-gold/30 bg-gold/10',
  NOT_REQUIRED:  'text-taupe border-taupe/30 bg-taupe/10',
}
const PRODUCT_PURCHASE_EVENT = 'bigauction:product-purchase'

// ── Helpers ───────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)} day ago`
}

// ── Icons ────────────────────────────────────────────────────────────
function IconCalendar({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
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
function IconZoom({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  )
}
function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}
function IconChevronLeft({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  )
}
function IconChevronRight({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}
function IconInfo({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  )
}

// Inclusion icon map
function InclusionIcon({ label }) {
  const icons = {
    'Original Box': '📦',
    'Dust Bag':     '🛍',
    'Auth Card':    '🪪',
    'Warranty Card':'📋',
    'Original Receipt': '🧾',
  }
  return <span className="text-base leading-none">{icons[label] || '✓'}</span>
}

// Product summary icons
function SummaryIcon({ field }) {
  const map = {
    brand:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
    model:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    material: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    year:     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    serial:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75z" /></svg>,
    origin:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" /></svg>,
    condition:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  }
  return map[field] || null
}

// ── Countdown hook ────────────────────────────────────────────────────
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

// ── Buy Ticket Modal — 3-step flow ───────────────────────────────────
function BuyTicketModal({ auction, product, wallet, onClose, onCardPayment }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [step, setStep]           = useState(1)
  const [payMethod, setPayMethod] = useState('wallet')
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState(null)

  const ticketPrice   = Number(auction.ticketPrice || 0)
  const currency      = auction.currency || 'AED'
  const walletBal     = wallet ? Number(wallet.balance) : 0
  const canUseWallet  = walletBal >= ticketPrice
  const imgUrl        = product.imageUrls?.[0] || null
  const isActive      = auction.status === 'ACTIVE'

  const rewardCredits = wallet ? Number(wallet.rewardCredits || 0) : 0
  const canUseCredits = rewardCredits >= ticketPrice
  const hasPartialCredits = rewardCredits > 0 && rewardCredits < ticketPrice

  const fmt2 = n => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const eventTime = (() => {
    const src = isActive ? auction.scheduledEndTime : auction.scheduledStartTime
    if (!src) return '—'
    return new Date(src).toLocaleString('en-AE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }) + ' (GST)'
  })()

  const auctionStateLabel = isActive ? 'Live Auction' : 'Starting Soon'
  const eventTimeLabel = isActive ? 'End Time' : 'Start Time'

  const countdown = useCountdown(isActive ? auction.scheduledEndTime : auction.scheduledStartTime)
  const pad = n => String(n).padStart(2, '0')

  const TITLES = ['', 'TICKET DETAILS', 'CHOOSE PAYMENT METHOD', 'TICKET PURCHASED']

  const methodLabel = payMethod === 'wallet' ? 'Wallet Balance' : payMethod === 'credits' ? 'Reward Credits' : 'Credit / Debit Card'

  const onAddMoney = () => {
    navigate('/wallet', {
      state: {
        openTopUp: true,
        returnTo: `${location.pathname}${location.search}`,
        returnLabel: product.name,
        requiredAmount: Math.max(ticketPrice - walletBal, 0),
      },
    })
  }

  const onConfirm = async () => {
    if (payMethod === 'card') { onCardPayment(); return }
    setBusy(true); setError(null)
    try {
      await dispatch(purchaseTicket({
        auctionId: auction.id,
        payment: payMethod === 'credits'
          ? { paymentMethod: 'REWARD_CREDITS', creditToApply: ticketPrice }
          : { paymentMethod: 'WALLET' },
      })).unwrap()
      setStep(3)
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Purchase failed. Please try again.')
    } finally { setBusy(false) }
  }

  // ── Shared radio button ──
  const Radio = ({ active }) => (
    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${active ? 'border-emerald bg-emerald' : 'border-[#ccc]'}`}>
      {active && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  )

  // ── Inline SVG icons ──
  const IcoWallet = () => (
    <svg className="w-4 h-4 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  )
  const IcoStar = ({ className = 'w-4 h-4' }) => (
    <svg className={`${className} text-gold`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
  const IcoCard = () => (
    <svg className="w-5 h-5 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  )
  const IcoTag = () => (
    <svg className="w-3.5 h-3.5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  )
  const IcoClock = () => (
    <svg className="w-3.5 h-3.5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/>
    </svg>
  )
  const IcoTimer = () => (
    <svg className="w-3.5 h-3.5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  )
  const IcoTicketSm = () => (
    <svg className="w-3.5 h-3.5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  )
  const IcoDoc = () => (
    <svg className="w-3.5 h-3.5 text-[#aaa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  const IcoLock = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
  const IcoX = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-almost-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-luxury flex flex-col max-h-[92vh]">

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0ece6] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#888] border border-[#ddd] rounded px-1.5 py-0.5 leading-none">STEP {step}</span>
            <span className="w-px h-4 bg-[#e0dbd4]" />
            <span className="text-[13px] font-bold text-[#222] tracking-wide">{TITLES[step]}</span>
          </div>
          {step < 3 && (
            <button onClick={onClose} className="text-[#999] hover:text-[#333] transition-colors">
              <IcoX />
            </button>
          )}
        </div>

        {/* ── Scrollable content ── */}
        <div className="overflow-y-auto flex-1">

          {/* ════════════════════════════════
              STEP 1 — TICKET DETAILS
          ════════════════════════════════ */}
          {step === 1 && (
            <div className="p-5 space-y-5">

              {/* Product: large image left, info right */}
              <div className="flex gap-4">
                {imgUrl
                  ? (
                    <div className="w-[195px] h-[220px] rounded-xl bg-[#f3ede6] flex items-center justify-center flex-shrink-0 p-2">
                      <img src={imgUrl} alt={product.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  )
                  : <div className="w-[195px] h-[220px] rounded-xl bg-[#f3ede6] flex-shrink-0" />
                }
                <div className="flex flex-col justify-start pt-1 min-w-0 flex-1">
                  <p className="text-[#c8873a] text-[11px] font-bold uppercase tracking-widest mb-1">{product.brand}</p>
                  <p className="text-[#1a1a1a] font-bold text-[19px] leading-tight mb-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{product.name}</p>
                  {product.modelName && (
                    <p className="text-[#999] text-xs mb-3">{product.modelName}</p>
                  )}
                  {/* Status badge — outlined style */}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 border border-emerald text-emerald text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
                      Live Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 border border-emerald/30 bg-emerald/10 text-[#1a1a1a] text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full w-fit">
                      <svg className="w-3 h-3 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      Starts Soon
                    </span>
                  )}

                  {/* "Auction starts in" + countdown boxes — beside the image */}
                  <p className="text-[#888] text-xs mt-3 mb-2">{isActive ? 'Auction ends in' : 'Auction starts in'}</p>
                  <div className="flex gap-1 min-w-0">
                    {[['DAYS', pad(countdown.dd)], ['HRS', pad(countdown.hh)], ['MINS', pad(countdown.mm)], ['SECS', pad(countdown.ss)]].map(([unit, val]) => (
                      <div key={unit} className="flex-1 min-w-0 border border-[#e3d5c4] rounded-lg py-1.5 flex flex-col items-center bg-[#f3ede6]">
                        <span className="text-[#1a1a1a] font-bold text-base tabular-nums leading-none">{val}</span>
                        <span className="text-[#8a7660] text-[7px] font-semibold uppercase mt-1 tracking-normal">{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info rows: icon + label + value, bordered card */}
              <div className="border border-[#e8e2da] rounded-xl px-4 py-3.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#888] text-sm flex items-center gap-2"><IcoTag />Auction Type</span>
                  <span className="text-[#1a1a1a] text-sm font-semibold">{auction.auctionType || 'Live Auction'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#888] text-sm flex items-center gap-2"><IcoClock />{eventTimeLabel}</span>
                  <span className="text-[#1a1a1a] text-sm font-semibold">{eventTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#888] text-sm flex items-center gap-2"><IcoTimer />Estimated Duration</span>
                  <span className="text-[#c8873a] text-sm font-semibold">{currency} {ticketPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* One-ticket notice box — gold border */}
              <div className="border border-[#e8c98a] bg-[#fdf8ee] rounded-xl px-4 py-3.5 flex gap-3 items-start">
                <svg className="w-4 h-4 text-[#c8873a] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01"/>
                </svg>
                <div>
                  <p className="text-[#1a1a1a] text-[13px] font-semibold">One ticket per user for this auction.</p>
                  <p className="text-[#888] text-xs mt-1 leading-relaxed">The ticket lets you join the live auction and place offers.</p>
                </div>
              </div>

              {/* Wallet Balance + Reward Credits — single bordered card, split by divider */}
              <div className="border border-[#e8e2da] rounded-xl px-4 py-3 flex items-stretch">
                {/* Wallet Balance */}
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <IcoWallet />
                    <span className="text-[#666] text-xs">Wallet Balance</span>
                    <svg className="w-3.5 h-3.5 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01"/>
                    </svg>
                  </div>
                  <p className="text-[#1a1a1a] font-bold text-[15px]">{currency} {fmt2(walletBal)}</p>
                </div>
                <span className="w-px bg-[#e8e2da]" />
                {/* Reward Credits */}
                <div className="flex-1 pl-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <IcoStar className="w-4 h-4" />
                    <span className="text-[#666] text-xs">Reward Credits</span>
                    <svg className="w-3.5 h-3.5 text-[#bbb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01"/>
                    </svg>
                  </div>
                  <p className="text-[#c8873a] font-bold text-[15px]">{currency} {fmt2(rewardCredits)}</p>
                </div>
              </div>

              {/* Terms */}
              <p className="text-center text-[#888] text-xs">
                By continuing, you agree to our{' '}
                <span className="text-emerald font-medium underline cursor-pointer">Terms &amp; Conditions</span>
              </p>

              {/* CTA */}
              <button
                onClick={() => setStep(2)}
                className="w-full bg-emerald text-white font-semibold text-sm rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Continue to Payment
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ════════════════════════════════
              STEP 2 — CHOOSE PAYMENT METHOD
          ════════════════════════════════ */}
          {step === 2 && (
            <div className="p-5 space-y-5">

              {/* Mini product summary — plain, no card bg */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  {imgUrl
                    ? <img src={imgUrl} alt={product.name} className="w-[90px] h-[80px] rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-[90px] h-[80px] rounded-lg bg-[#e8e2da] flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[#1a1a1a] font-bold text-[15px] truncate" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{product.name}</p>
                      <p className="text-[#888] text-xs mt-0.5">{product.modelName || product.brand}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888] text-sm">Ticket Price</span>
                      <span className="text-emerald font-bold text-sm">{currency} {ticketPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#ece6de]" />
              </div>

              {/* Payment options */}
              <div>
                <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">Select Payment Method</p>
                <div className="space-y-2.5">

                  {/* ── Wallet Balance ── */}
                  <button
                    onClick={() => canUseWallet && setPayMethod('wallet')}
                    disabled={!canUseWallet}
                    className={`w-full border rounded-xl px-4 pt-3.5 pb-3 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      payMethod === 'wallet' ? 'border-emerald' : 'border-[#e0dbd4] hover:border-[#bbb]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Radio active={payMethod === 'wallet'} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="text-[#1a1a1a] text-[13px] font-semibold">Wallet Balance</p>
                          <p className="text-[#1a1a1a] text-[13px] font-bold">{currency} {fmt2(walletBal)}</p>
                        </div>
                        <p className="text-[#999] text-[11px] mt-0.5">Available Balance</p>
                        <div className="border-t border-[#f0ece6] mt-2.5 pt-2.5 flex items-center justify-between">
                          <span className="text-[#888] text-[11px]">You will pay</span>
                          <span className="text-[#1a1a1a] text-[13px] font-bold">{currency} {ticketPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {!canUseWallet && (
                    <div className="rounded-xl border border-gold/30 bg-[#fdf8ee] px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[#1a1a1a] text-[12px] font-semibold">Not enough wallet balance</p>
                        <p className="text-[#888] text-[10px] mt-0.5">
                          Add {currency} {fmt2(ticketPrice - walletBal)} to use your wallet.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onAddMoney}
                        className="flex-shrink-0 bg-gold text-charcoal text-[11px] font-bold px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Add Money
                      </button>
                    </div>
                  )}

                  {/* ── Reward Credits ── */}
                  <button
                    onClick={() => canUseCredits && setPayMethod('credits')}
                    disabled={!canUseCredits}
                    className={`w-full border rounded-xl px-4 pt-3.5 pb-3 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      payMethod === 'credits' ? 'border-emerald' : 'border-[#e0dbd4] hover:border-[#bbb]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Radio active={payMethod === 'credits'} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            <IcoStar className="w-[15px] h-[15px]" />
                            <p className="text-[#1a1a1a] text-[13px] font-semibold">Reward Credits</p>
                          </div>
                          <p className="text-[#c8873a] text-[13px] font-bold">{currency} {fmt2(rewardCredits)}</p>
                        </div>
                        <p className="text-[#999] text-[11px] mt-0.5">Available Credits</p>
                        <div className="border-t border-[#f0ece6] mt-2.5 pt-2.5 flex items-center justify-between">
                          <span className="text-[#888] text-[11px]">You will pay</span>
                          <span className="text-[#c8873a] text-[13px] font-bold">{currency} {ticketPrice.toLocaleString()} (Credits)</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-[#aaa] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01"/>
                          </svg>
                          <p className="text-[#999] text-[10px]">
                            {canUseCredits
                              ? 'Reward Credits can be used for this auction ticket.'
                              : hasPartialCredits
                                ? 'Insufficient Reward Credits for this ticket.'
                                : 'Reward Credits can only be used for auction tickets.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* ── Credit / Debit Card ── */}
                  <button
                    onClick={() => setPayMethod('card')}
                    className={`w-full border rounded-xl px-4 py-3.5 text-left transition-all ${
                      payMethod === 'card' ? 'border-emerald' : 'border-[#e0dbd4] hover:border-[#bbb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Radio active={payMethod === 'card'} />
                      <IcoCard />
                      <div className="flex-1">
                        <p className="text-[#1a1a1a] text-[13px] font-semibold">Credit / Debit Card</p>
                        <p className="text-[#999] text-[11px] mt-0.5">Pay securely using your card</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="bg-[#1A1F71] text-white text-[9px] font-bold italic px-2 py-[3px] rounded">VISA</span>
                        <div className="flex -space-x-1.5">
                          <div className="w-[20px] h-[20px] rounded-full bg-[#EB001B]" />
                          <div className="w-[20px] h-[20px] rounded-full bg-[#F79E1B]" />
                        </div>
                      </div>
                    </div>
                  </button>

                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div>
                <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">Order Summary</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#888] text-sm">Ticket Price</span>
                    <span className="text-[#1a1a1a] text-sm font-medium">{currency} {ticketPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888] text-sm">Payment Method</span>
                    <span className="text-[#1a1a1a] text-sm font-medium">{methodLabel}</span>
                  </div>
                </div>
                <div className="border-t border-[#ece6de] mt-3 pt-3 flex justify-between items-center">
                  <span className="text-[#1a1a1a] text-sm font-bold">Total Due</span>
                  <span className="text-[#1a1a1a] text-lg font-bold">{currency} {ticketPrice.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Secure note */}
              <div className="flex items-center justify-center gap-1.5 text-[#999] text-xs">
                <IcoLock />
                Secure payment – your data is protected.
              </div>

              {/* Confirm CTA */}
              <button
                onClick={onConfirm}
                disabled={busy}
                className="w-full bg-emerald text-white font-semibold text-sm rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
              >
                <IcoLock />
                {busy ? 'Processing…' : 'Confirm Ticket Purchase'}
              </button>
            </div>
          )}

          {/* ════════════════════════════════
              STEP 3 — TICKET PURCHASED
          ════════════════════════════════ */}
          {step === 3 && (
            <div>

              {/* Success banner — cream bg with scattered diamonds */}
              <div className="relative bg-[#f5f0e8] overflow-hidden flex flex-col items-center py-8 px-5">
                {/* Diamond confetti */}
                {[
                  { top: '12px',  left: '28px',  size: 10, color: '#c8873a', opacity: 0.5 },
                  { top: '20px',  left: '68px',  size:  7, color: '#c8873a', opacity: 0.35 },
                  { top:  '8px',  right:'44px',  size:  8, color: '#2d5016', opacity: 0.3 },
                  { top: '30px',  right:'18px',  size:  6, color: '#c8873a', opacity: 0.55 },
                  { bottom:'18px',left: '22px',  size:  7, color: '#2d5016', opacity: 0.35 },
                  { bottom:'10px',left: '72px',  size:  5, color: '#c8873a', opacity: 0.4 },
                  { bottom:'14px',right:'34px',  size:  9, color: '#c8873a', opacity: 0.35 },
                  { top: '44px',  left:  '8px',  size:  5, color: '#2d5016', opacity: 0.25 },
                  { top: '14px',  right:'80px',  size:  6, color: '#c8873a', opacity: 0.3 },
                  { bottom:'28px',right:'10px',  size:  6, color: '#2d5016', opacity: 0.3 },
                ].map((d, i) => (
                  <div key={i} className="absolute" style={{
                    top: d.top, bottom: d.bottom, left: d.left, right: d.right,
                    width: d.size, height: d.size,
                    backgroundColor: d.color, opacity: d.opacity,
                    transform: 'rotate(45deg)',
                  }} />
                ))}

                {/* Green circle checkmark */}
                <div className="relative z-10 w-[72px] h-[72px] bg-emerald rounded-full flex items-center justify-center shadow-md">
                  <IconCheck className="w-9 h-9 text-white" />
                </div>

                <h3 className="relative z-10 text-emerald font-display font-bold text-[26px] mt-4 leading-tight">Ticket Purchased!</h3>
                <p className="relative z-10 text-[#777] text-sm mt-1">You're now ready to join this auction.</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Product confirmation card — cream bg */}
                <div className="bg-[#f8f3ec] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-4">
                    {imgUrl
                      ? <img src={imgUrl} alt={product.name} className="w-[60px] h-[60px] rounded-xl object-cover flex-shrink-0" />
                      : <div className="w-[60px] h-[60px] rounded-xl bg-[#e8e2da] flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-[#1a1a1a] font-bold text-[13px]">{product.name}</p>
                      <p className="text-[#888] text-xs mt-0.5">{product.modelName || product.brand}</p>
                    </div>
                  </div>
                  <div className="border-t border-[#ece6de] divide-y divide-[#ece6de]">
                    {[
                      { ico: <IcoTag />,      label: 'Auction Status', value: auctionStateLabel },
                      { ico: <IcoClock />,    label: eventTimeLabel,   value: eventTime },
                      { ico: <IcoTicketSm />, label: 'Ticket Price', value: `${currency} ${ticketPrice.toLocaleString()}` },
                      { ico: <IcoDoc />,      label: 'Ticket Status', value: null },
                    ].map(({ ico, label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-[#888] text-xs flex items-center gap-2">{ico}{label}</span>
                        {label === 'Ticket Status' ? (
                          <span className="border border-[#bbb] text-[#444] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                            CONFIRMED
                          </span>
                        ) : (
                          <span className="text-[#1a1a1a] text-xs font-semibold text-right">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thank you box */}
                <div className="border border-[#e8e2da] rounded-xl px-4 py-3.5 flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">🎁</span>
                  <div>
                    <p className="text-emerald text-[13px] font-semibold">Thank you for participating!</p>
                    <p className="text-[#888] text-xs mt-1 leading-relaxed">You can view your ticket and auction details anytime in My Tickets.</p>
                  </div>
                </div>

                {/* Buttons */}
                <button
                  onClick={onClose}
                  className="w-full bg-emerald text-white font-semibold text-sm rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  View Auction
                  <IconChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/auctions')}
                  className="w-full border border-[#e0dbd4] text-[#1a1a1a] text-sm font-semibold rounded-xl py-3.5 hover:bg-[#f8f3ec] transition-colors"
                >
                  Back to Auctions
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Image Zoom Lightbox ───────────────────────────────────────────────
function ImageZoom({ imageUrl, alt, onClose, onPrev, onNext, hasMultiple }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasMultiple) onPrev()
      if (e.key === 'ArrowRight' && hasMultiple) onNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext, hasMultiple])

  return (
    <div className="fixed inset-0 z-50 bg-almost-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-taupe hover:text-ivory text-3xl font-light leading-none z-10">×</button>
      {hasMultiple && (
        <>
          <button onClick={e => { e.stopPropagation(); onPrev() }} aria-label="Previous image" className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-charcoal flex items-center justify-center shadow-xl z-10"><IconChevronLeft className="w-6 h-6" /></button>
          <button onClick={e => { e.stopPropagation(); onNext() }} aria-label="Next image" className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-charcoal flex items-center justify-center shadow-xl z-10"><IconChevronRight className="w-6 h-6" /></button>
        </>
      )}
      <img src={imageUrl} alt={alt} onClick={e => e.stopPropagation()} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
    </div>
  )
}

// ── Right: Live Auction Panel ─────────────────────────────────────────
function LiveAuctionPanel({ auction, bids, product }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user }   = useSelector(s => s.auth)
  const { wallet } = useSelector(s => s.wallet)
  const { loading, userHasTicket } = useSelector(s => s.auctions)

  const [bidAmount, setBidAmount]               = useState('')
  const [autoBidStart, setAutoBidStart]         = useState('')
  const [autoBidIncrement, setAutoBidIncrement] = useState('')
  const [autoBidMax, setAutoBidMax]             = useState('')
  const [autoBidToMax, setAutoBidToMax]         = useState(false)
  const [autoBidLoading, setAutoBidLoading]     = useState(false)
  const [autoBidMsg, setAutoBidMsg]             = useState(null)
  const [activeTab, setActiveTab]               = useState('place') // 'place' | 'manual'
  const [showLeaderboard, setShowLeaderboard]   = useState(false)
  const [msg, setMsg]                           = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { autoBidConfig } = useSelector(s => s.auctions)

  useEffect(() => {
    if (location.state?.autoTicket) {
      if (!user) { navigate('/login'); return }
      setShowPaymentModal(true)
      window.history.replaceState({}, '')
    }
  }, [location.state?.autoTicket, user])

  useWebSocket(auction?.id)
  useEffect(() => { if (user) dispatch(fetchWallet()) }, [user])

  // Load existing auto bid config for this auction
  useEffect(() => {
    if (user && auction?.id && auction?.status === 'ACTIVE') {
      dispatch(getAutoBid(auction.id))
    }
  }, [user, auction?.id, auction?.status])

  // Pre-fill form when config loads
  useEffect(() => {
    if (autoBidConfig?.enabled) {
      setAutoBidIncrement(String(autoBidConfig.increment))
      setAutoBidMax(String(autoBidConfig.maxLimit))
    }
  }, [autoBidConfig])

  const walletBal     = wallet ? Number(wallet.balance) : 0
  const currentBid    = bids.length > 0 ? Number(bids[0].amount) : Number(auction.currentHighestBid || 0)
  const liveBidderName = bids.length > 0 ? bids[0].bidderName : auction.highestBidderName
  const liveBidTime   = bids.length > 0 ? bids[0].createdAt  : null
  const bidIncrement  = auction.bidIncrement ? Number(auction.bidIncrement) : 100
  const minNextBid    = currentBid + bidIncrement
  const maxBidAmount  = auction.maxBidAmount ? Number(auction.maxBidAmount) : null
  const ticketsSold   = auction.ticketsSold  || 0
  const ticketTarget  = auction.ticketTarget || 0
  const ticketPct     = ticketTarget > 0 ? Math.min((ticketsSold / ticketTarget) * 100, 100) : 0
  const pad = n => String(n).padStart(2, '0')

  const countdown = useCountdown(auction.scheduledEndTime)
  const countdownStr = `${pad(countdown.dd)}:${pad(countdown.hh)}:${pad(countdown.mm)}:${pad(countdown.ss)}`

  // Leaderboard aggregation
  const leaderboard = useMemo(() => {
    if (!bids || bids.length === 0) return []
    const map = {}
    bids.forEach(b => {
      const key = b.bidderId || b.bidderName || 'anon'
      const amount = Number(b.amount)
      if (!map[key]) {
        map[key] = { name: b.bidderName || 'Anonymous', highest: amount, count: 0, lastAt: b.createdAt }
      }
      map[key].count++
      if (amount > map[key].highest) map[key].highest = amount
      if (b.createdAt && (!map[key].lastAt || new Date(b.createdAt) > new Date(map[key].lastAt))) {
        map[key].lastAt = b.createdAt
      }
    })
    return Object.values(map).sort((a, b) => b.highest - a.highest)
  }, [bids])

  const doAction = async (fn, ...args) => {
    setMsg(null)
    try {
      await dispatch(fn(...args)).unwrap()
      setMsg({ type: 'success', text: 'Done!' })
    } catch (e) {
      setMsg({ type: 'error', text: typeof e === 'string' ? e : e?.message || 'Something went wrong' })
    }
  }

  const onBid = e => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    doAction(placeBid, { auctionId: auction.id, amount: Number(bidAmount) })
    setBidAmount('')
  }

  const onTicket = () => {
    if (!user) { navigate('/login'); return }
    setShowPaymentModal(true)
  }

  const onCardPayment = () => { setShowPaymentModal(false); navigate('/checkout', { state: { type: 'ticket', product, auction } }) }

  const buyNowPrice = product.buyNowPrice ? Number(product.buyNowPrice) : null
  const isActive  = auction.status === 'ACTIVE'
  const isSold    = auction.status === 'SOLD'
  const isClosed  = auction.status === 'CLOSED'
  const isEnded   = isSold || isClosed
  const isWinner  = user && auction.winnerId === user.id
  const buyNowAvail = !!(buyNowPrice && auction.buyNowAvailable && !isActive && !isEnded)
  const onBuyNow    = () => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { type: 'buynow', product, auction } })
  }

  useEffect(() => {
    const handlePurchaseRequest = event => {
      if (event.detail === 'ticket') onTicket()
      if (event.detail === 'buyNow' && buyNowAvail) onBuyNow()
    }
    window.addEventListener(PRODUCT_PURCHASE_EVENT, handlePurchaseRequest)
    return () => window.removeEventListener(PRODUCT_PURCHASE_EVENT, handlePurchaseRequest)
  })

  const onSetupAutoBid = async e => {
    e.preventDefault()
    if (!autoBidIncrement || !autoBidMax) return
    setAutoBidLoading(true); setAutoBidMsg(null)
    try {
      await dispatch(setupAutoBid({
        auctionId:   auction.id,
        increment:   Number(autoBidIncrement),
        maxLimit:    Number(autoBidMax),
        startingBid: autoBidStart ? Number(autoBidStart) : undefined,
      })).unwrap()
      setAutoBidMsg({ type: 'success', text: 'Auto bid is active!' })
    } catch (e) {
      setAutoBidMsg({ type: 'error', text: typeof e === 'string' ? e : e?.message || 'Failed to configure auto bid' })
    } finally { setAutoBidLoading(false) }
  }

  const onDisableAutoBid = async () => {
    setAutoBidLoading(true); setAutoBidMsg(null)
    try {
      await dispatch(disableAutoBid(auction.id)).unwrap()
      setAutoBidMsg({ type: 'success', text: 'Auto bid disabled.' })
      setAutoBidStart(''); setAutoBidIncrement(''); setAutoBidMax(''); setAutoBidToMax(false)
    } catch (e) {
      setAutoBidMsg({ type: 'error', text: typeof e === 'string' ? e : e?.message || 'Failed to disable auto bid' })
    } finally { setAutoBidLoading(false) }
  }

  const onCheckout = () => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { type: 'auction', product, auction } })
  }

  const quickMultipliers = [
    { label: '+AED ' + (bidIncrement * 1).toLocaleString(), val: currentBid + bidIncrement * 1 },
    { label: '+AED ' + (bidIncrement * 2).toLocaleString(), val: currentBid + bidIncrement * 2 },
    { label: '+AED ' + (bidIncrement * 5).toLocaleString(), val: currentBid + bidIncrement * 5 },
  ]

  const leaderboardVisible = showLeaderboard ? leaderboard : leaderboard.slice(0, 5)

  return (
    <div className="space-y-0">

      {/* Header row: LIVE badge + countdown */}
      <div className="flex items-start justify-between border border-taupe/15 border-b-0 rounded-t-xl px-4 pt-4 pb-3">
        <span className="inline-flex items-center gap-2 text-emerald text-sm font-bold tracking-wide uppercase mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
          </span>
          Live Auction
        </span>
        <div className="text-right">
          <p className="text-taupe text-[10px] font-medium mb-1">Auction ends in</p>
          <div className="flex items-center justify-end gap-1">
            {[pad(countdown.dd), pad(countdown.hh), pad(countdown.mm), pad(countdown.ss)].map((val, i) => (
              <span key={i} className="text-charcoal font-bold text-lg leading-none tabular-nums">
                {i > 0 && <span className="text-taupe/50 mr-1">:</span>}{val}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-end gap-[13px] mt-1">
            {['DD', 'HH', 'MM', 'SS'].map(unit => (
              <span key={unit} className="text-taupe/60 text-[8px] font-semibold w-4 text-center">{unit}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Two price boxes */}
      <div className="grid grid-cols-2 gap-3 border-x border-taupe/15 px-4 pb-4">
        {/* Highest offer — dark green */}
        <div className="bg-emerald rounded-xl px-4 py-5 flex flex-col items-center text-center gap-2">
          <p className="text-ivory/85 text-[10px] font-bold tracking-[0.12em] uppercase leading-tight">Highest Offer Now</p>
          <p className="text-ivory text-2xl font-semibold font-display animate-bid-pop leading-none">
            {currentBid > 0 ? `AED ${currentBid.toLocaleString()}` : '—'}
          </p>
          {liveBidderName && currentBid > 0 ? (
            <p className="text-ivory/80 text-[11px] leading-tight">by {liveBidderName}<br />{liveBidTime ? timeAgo(liveBidTime) : ''}</p>
          ) : (
            <p className="text-ivory/40 text-[10px] leading-none">No offers yet</p>
          )}
        </div>

        {/* Max bid amount — white bordered */}
        <div className="border border-gold/35 rounded-xl px-4 py-5 flex flex-col items-center text-center gap-2 bg-[#fffdf9]">
          <p className="text-gold text-[10px] font-bold tracking-[0.12em] uppercase leading-tight">Maximum Bid Amount</p>
          <p className="text-[#5b5751] text-2xl font-semibold font-display leading-none">
            {maxBidAmount ? `AED ${maxBidAmount.toLocaleString()}` : '—'}
          </p>
          <p className="text-[#6f6962] text-[10px] leading-none flex items-center gap-0.5">
            The highest allowed offer
            <IconInfo className="w-3 h-3 inline-block ml-0.5 text-taupe/40" />
          </p>
        </div>
      </div>

      {/* Stats row: 3 cols */}
      <div className="border border-taupe/15 rounded-b-xl overflow-hidden mb-4">
        <div className="grid grid-cols-3 divide-x divide-taupe/15">

          {/* Ticket price */}
          <div className="px-3 py-3 flex flex-col items-center gap-1 text-center">
            <p className="text-[#57524c] text-[9px] font-bold tracking-wider uppercase leading-tight">Auction Ticket Price</p>
            <p className="text-charcoal font-bold text-base leading-none">AED {Number(auction.ticketPrice || 0).toLocaleString()}</p>
            <p className="text-[#77716a] text-[9px] leading-none">One ticket per user</p>
          </div>

          {/* Tickets sold */}
          <div className="px-3 py-3 flex flex-col items-center gap-1 text-center">
            <p className="text-[#57524c] text-[9px] font-bold tracking-wider uppercase leading-tight">Tickets Sold</p>
            <p className="text-charcoal font-bold text-base leading-none">{ticketsSold} / {ticketTarget}</p>
            <div className="w-full h-1 bg-taupe/20 rounded-full overflow-hidden my-0.5">
              <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${ticketPct}%` }} />
            </div>
            <p className="text-gold text-[9px] font-semibold leading-none">{ticketPct.toFixed(0)}% sold</p>
          </div>

          {/* Countdown */}
          <div className="px-3 py-3 flex flex-col items-center gap-1 text-center">
            <p className="text-[#57524c] text-[9px] font-bold tracking-wider uppercase leading-tight">Auction Ends In</p>
            <div className="flex items-center gap-0.5">
              {[[pad(countdown.dd),'DD'],[pad(countdown.hh),'HH'],[pad(countdown.mm),'MM'],[pad(countdown.ss),'SS']].map(([val, unit], i) => (
                <div key={unit} className="flex items-center">
                  {i > 0 && <span className="text-gold text-xs mx-px">:</span>}
                  <div className="flex flex-col items-center">
                    <span className="text-charcoal font-bold text-sm leading-none tabular-nums">{val}</span>
                    <span className="text-taupe text-[7px] leading-none mt-0.5">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Ticket purchased banner */}
      {user && userHasTicket && (
        <div className="flex items-center justify-between bg-emerald/10 border border-emerald/25 rounded-xl px-4 py-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-emerald rounded-full flex items-center justify-center flex-shrink-0">
              <IconCheck className="w-3 h-3 text-ivory" />
            </span>
            <div>
              <p className="text-emerald text-xs font-bold uppercase tracking-wider leading-tight">Ticket Purchased</p>
              <p className="text-emerald/70 text-[10px] leading-none">You're in the auction</p>
            </div>
          </div>
          <button className="text-emerald border border-emerald/30 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-emerald/10 transition-colors">
            View Ticket
          </button>
        </div>
      )}

      {/* Trust line */}
      <div className="flex items-center gap-3 text-taupe/50 text-[10px] mb-4">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-taupe/30 inline-flex items-center justify-center text-[7px]">○</span> One ticket per user applies.</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-taupe/30 inline-flex items-center justify-center text-[7px]">○</span> Secure. Transparent. Trusted.</span>
      </div>

      {/* Messages */}
      {msg && (
        <div className={`text-sm rounded-lg px-4 py-3 mb-3 ${msg.type === 'success' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-burgundy/10 text-burgundy border border-burgundy/20'}`}>
          {msg.text}
        </div>
      )}

      {/* Winner checkout */}
      {isEnded && isWinner && (
        <div className="bg-emerald/10 border border-emerald/25 rounded-xl p-5 space-y-3 mb-3">
          <p className="text-emerald font-semibold text-lg font-display">You won this auction!</p>
          <p className="text-taupe text-sm">Winning bid: <span className="text-charcoal font-semibold">AED {currentBid.toLocaleString()}</span></p>
          <button onClick={onCheckout} className="w-full bg-emerald text-ivory font-bold py-3.5 rounded-xl hover:bg-emerald/90 transition-colors btn-shimmer">
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Ended — not winner */}
      {isEnded && !isWinner && (
        <div className="bg-taupe/5 border border-taupe/15 rounded-xl px-5 py-4 mb-3">
          <p className="text-taupe text-sm">
            {isSold ? 'This auction has ended.' : 'This auction closed without a winner.'}
          </p>
        </div>
      )}

      {/* Bidding area — only when active */}
      {isActive && (
        <div className="border border-taupe/15 rounded-xl overflow-hidden mb-4">

          {/* Sign in prompt */}
          {!user && (
            <div className="p-5 text-center">
              <p className="text-taupe text-sm mb-3">Sign in to participate in this auction</p>
              <button onClick={() => navigate('/login')} className="bg-emerald text-ivory font-bold px-6 py-2.5 rounded-xl hover:bg-emerald/90 transition-colors text-sm">
                Sign In
              </button>
            </div>
          )}

          {/* Buy ticket prompt */}
          {user && !userHasTicket && (
            <div className="p-5 text-center space-y-3">
              <p className="text-taupe text-sm">Purchase a ticket to join the live auction</p>
              <button
                onClick={onTicket}
                disabled={loading}
                className="w-full bg-emerald text-ivory font-bold py-3.5 rounded-xl hover:bg-emerald/90 disabled:opacity-50 transition-colors btn-shimmer flex items-center justify-center gap-2"
              >
                <IconTicket className="w-4 h-4" />
                {loading ? 'Processing…' : `Buy Auction Ticket — AED ${Number(auction.ticketPrice || 0).toLocaleString()}`}
              </button>
            </div>
          )}

          {/* Tabs + bid forms */}
          {user && userHasTicket && (
            <>
              {/* Tab headers */}
              <div className="flex border-b border-taupe/15">
                <button
                  onClick={() => setActiveTab('place')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === 'place'
                      ? 'text-emerald border-emerald'
                      : 'text-taupe border-transparent hover:text-charcoal'
                  }`}
                >
                  Place Offer
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === 'manual'
                      ? 'text-emerald border-emerald'
                      : 'text-taupe border-transparent hover:text-charcoal'
                  }`}
                >
                  Manual Bid
                </button>
              </div>

              {/* PLACE OFFER tab */}
              {activeTab === 'place' && (
                <div className="p-4 space-y-4">
                  {/* Info row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-taupe text-[9px] font-semibold uppercase tracking-wider leading-tight">Next Valid Offer</p>
                      <p className="text-charcoal text-xs font-bold mt-0.5">AED {minNextBid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-taupe text-[9px] font-semibold uppercase tracking-wider leading-tight">Increment</p>
                      <p className="text-charcoal text-xs font-bold mt-0.5">AED {bidIncrement.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-taupe text-[9px] font-semibold uppercase tracking-wider leading-tight">Max Bid Amount</p>
                      <p className="text-charcoal text-xs font-bold mt-0.5">{maxBidAmount ? `AED ${maxBidAmount.toLocaleString()}` : '—'}</p>
                    </div>
                  </div>

                  {/* Quick increment buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {quickMultipliers.map(({ label, val }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBidAmount(String(val))}
                        disabled={loading}
                        className={`py-2.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                          Number(bidAmount) === val
                            ? 'bg-emerald text-ivory border-emerald'
                            : 'bg-taupe/8 border-taupe/20 text-charcoal hover:border-emerald/50 hover:bg-emerald/8'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <div>
                    <p className="text-taupe text-[10px] mb-1.5">Custom amount (must follow AED {bidIncrement.toLocaleString()} increments)</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        placeholder="Enter amount"
                        min={minNextBid}
                        className="flex-1 bg-white border border-taupe/25 text-charcoal placeholder-taupe/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
                      />
                      <span className="text-taupe text-sm font-medium flex-shrink-0">AED</span>
                    </div>
                  </div>

                  {/* Place Offer button */}
                  <form onSubmit={onBid}>
                    <button
                      type="submit"
                      disabled={loading || !bidAmount}
                      className="w-full bg-emerald text-ivory font-bold py-3.5 rounded-xl hover:bg-emerald/90 disabled:opacity-50 transition-colors btn-shimmer uppercase tracking-wider text-sm"
                    >
                      {loading ? 'Processing…' : 'Place Offer'}
                    </button>
                  </form>

                  <p className="text-taupe/60 text-[10px] text-center leading-relaxed">
                    By placing an offer you agree to the auction terms. Offers are binding.
                  </p>
                </div>
              )}

              {/* MANUAL BID tab */}
              {activeTab === 'manual' && (
                <div className="p-4 space-y-4">
                  <p className="text-taupe text-xs">Enter a specific offer amount manually. Must be at least AED {minNextBid.toLocaleString()}.</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      placeholder={`Min AED ${minNextBid.toLocaleString()}`}
                      min={minNextBid}
                      className="flex-1 bg-white border border-taupe/25 text-charcoal placeholder-taupe/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
                    />
                    <span className="text-taupe text-sm font-medium flex-shrink-0">AED</span>
                  </div>
                  <form onSubmit={onBid}>
                    <button
                      type="submit"
                      disabled={loading || !bidAmount}
                      className="w-full bg-emerald text-ivory font-bold py-3.5 rounded-xl hover:bg-emerald/90 disabled:opacity-50 transition-colors btn-shimmer uppercase tracking-wider text-sm"
                    >
                      {loading ? 'Processing…' : 'Place Offer'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* BUY NOW section */}
      {buyNowAvail && (
        <div className="border border-gold/35 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-gold/5">
            <div className="flex items-center gap-2">
              <IconBag className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Buy Now</span>
            </div>
            <span className="text-gold font-bold text-sm">AED {buyNowPrice.toLocaleString()}</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-taupe text-[11px] leading-relaxed">
              Skip the auction and purchase this item immediately at the Buy Now price.
            </p>
            <button
              onClick={onBuyNow}
              className="w-full bg-gold text-charcoal font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              <IconBag className="w-4 h-4" />
              Buy Now — AED {buyNowPrice.toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* AUTO BID section */}
      {isActive && user && userHasTicket && (
        <div className="border border-taupe/15 rounded-xl overflow-hidden mb-4">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-taupe/10 bg-taupe/4">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l.186.074c.76.303 1.014 1.255.5 1.88l-.956 1.147a1.875 1.875 0 01-1.44.677H6.91a1.875 1.875 0 01-1.44-.677L4.514 16.454c-.514-.625-.26-1.577.5-1.88L5 14.5" />
              </svg>
              <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Auto Bid</span>
            </div>
            {autoBidConfig?.enabled && (
              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald/10 text-emerald border border-emerald/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
                Active
              </span>
            )}
          </div>

          <div className="p-4 space-y-3">

            {/* Active config summary */}
            {autoBidConfig?.enabled && (
              <div className="bg-emerald/6 border border-emerald/20 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-emerald text-[10px] font-bold uppercase tracking-wider">Currently Active</p>
                  <p className="text-charcoal text-xs">
                    Increment: <span className="font-semibold">AED {Number(autoBidConfig.increment).toLocaleString()}</span>
                    <span className="text-taupe/60 mx-1.5">·</span>
                    Max limit: <span className="font-semibold">AED {Number(autoBidConfig.maxLimit).toLocaleString()}</span>
                  </p>
                </div>
                <button
                  onClick={onDisableAutoBid}
                  disabled={autoBidLoading}
                  className="text-burgundy border border-burgundy/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg hover:bg-burgundy/8 transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  Disable
                </button>
              </div>
            )}

            <p className="text-taupe text-[11px] leading-relaxed">
              The system automatically places bids on your behalf whenever you're outbid, up to your maximum limit.
            </p>

            <form onSubmit={onSetupAutoBid} className="space-y-3">

              {/* Starting Bid */}
              <div>
                <label className="text-taupe text-[10px] font-semibold uppercase tracking-wider block mb-1">
                  Starting Bid (AED)
                </label>
                <input
                  type="number"
                  value={autoBidStart}
                  onChange={e => setAutoBidStart(e.target.value)}
                  placeholder={`Min AED ${minNextBid.toLocaleString()}`}
                  min={minNextBid}
                  className="w-full bg-white border border-taupe/25 text-charcoal placeholder-taupe/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
                />
                <p className="text-taupe/60 text-[10px] mt-1">System places this bid immediately when auto bid is enabled.</p>
              </div>

              {/* Increment */}
              <div>
                <label className="text-taupe text-[10px] font-semibold uppercase tracking-wider block mb-1">
                  Bid Increment
                </label>
                <select
                  value={autoBidIncrement}
                  onChange={e => setAutoBidIncrement(e.target.value)}
                  className="w-full bg-white border border-taupe/25 text-charcoal rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald transition-colors"
                >
                  <option value="">Select increment</option>
                  <option value={bidIncrement}>AED {bidIncrement.toLocaleString()} per auto bid</option>
                  <option value={bidIncrement * 2}>AED {(bidIncrement * 2).toLocaleString()} per auto bid</option>
                  <option value={bidIncrement * 5}>AED {(bidIncrement * 5).toLocaleString()} per auto bid</option>
                </select>
              </div>

              {/* Max limit */}
              <div>
                <label className="text-taupe text-[10px] font-semibold uppercase tracking-wider block mb-1">
                  Maximum Limit (AED)
                </label>
                <input
                  type="number"
                  value={autoBidToMax ? (maxBidAmount || '') : autoBidMax}
                  onChange={e => { if (!autoBidToMax) setAutoBidMax(e.target.value) }}
                  disabled={autoBidToMax}
                  placeholder="e.g. 5,000"
                  min={minNextBid}
                  className="w-full bg-white border border-taupe/25 text-charcoal placeholder-taupe/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors disabled:bg-taupe/5 disabled:cursor-not-allowed"
                />
              </div>

              {/* Bid up to auction max checkbox */}
              {maxBidAmount && (
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoBidToMax}
                    onChange={e => {
                      setAutoBidToMax(e.target.checked)
                      if (e.target.checked) setAutoBidMax(String(maxBidAmount))
                      else setAutoBidMax('')
                    }}
                    className="mt-0.5 accent-emerald"
                  />
                  <span className="text-taupe text-[11px] leading-relaxed group-hover:text-charcoal transition-colors">
                    Bid up to maximum allowed (AED {maxBidAmount.toLocaleString()})
                  </span>
                </label>
              )}

              {/* Feedback message */}
              {autoBidMsg && (
                <div className={`text-xs rounded-lg px-3 py-2.5 ${autoBidMsg.type === 'success' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-burgundy/10 text-burgundy border border-burgundy/20'}`}>
                  {autoBidMsg.text}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={autoBidLoading || !autoBidIncrement || !autoBidMax}
                className="w-full bg-charcoal text-ivory font-bold py-3 rounded-xl hover:bg-charcoal/90 disabled:opacity-50 transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l.186.074c.76.303 1.014 1.255.5 1.88l-.956 1.147a1.875 1.875 0 01-1.44.677H6.91a1.875 1.875 0 01-1.44-.677L4.514 16.454c-.514-.625-.26-1.577.5-1.88L5 14.5" />
                </svg>
                {autoBidLoading ? 'Saving…' : autoBidConfig?.enabled ? 'Update Auto Bid' : 'Enable Auto Bid'}
              </button>
            </form>

            <div className="bg-gold/6 border border-gold/15 rounded-lg px-3 py-2.5">
              <p className="text-gold/80 text-[10px] leading-relaxed">
                <IconInfo className="w-3 h-3 inline-block mr-1 align-text-bottom" />
                Auto bid pauses when you are the highest bidder and fires immediately when outbid.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LIVE LEADERBOARD */}
      {leaderboard.length > 0 && (
        <div className="border border-taupe/15 rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-taupe/10 bg-taupe/5 flex items-center justify-between">
            <p className="text-charcoal text-xs font-bold uppercase tracking-widest">Live Leaderboard</p>
            <span className="text-taupe text-[10px]">{leaderboard.length} bidder{leaderboard.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-taupe/10">
                  <th className="text-left text-taupe text-[9px] font-semibold uppercase tracking-wider px-4 py-2">Rank</th>
                  <th className="text-left text-taupe text-[9px] font-semibold uppercase tracking-wider px-2 py-2">Bidder</th>
                  <th className="text-right text-taupe text-[9px] font-semibold uppercase tracking-wider px-2 py-2">Highest Offer</th>
                  <th className="text-center text-taupe text-[9px] font-semibold uppercase tracking-wider px-2 py-2"># Offers</th>
                  <th className="text-right text-taupe text-[9px] font-semibold uppercase tracking-wider px-4 py-2">Last Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/8">
                {leaderboardVisible.map((entry, i) => (
                  <tr key={entry.name + i} className={i === 0 ? 'bg-gold/5' : ''}>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${i === 0 ? 'text-gold' : i === 1 ? 'text-taupe' : 'text-taupe/60'}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-charcoal font-medium max-w-[80px] truncate">{entry.name}</td>
                    <td className={`px-2 py-2.5 text-right font-bold ${i === 0 ? 'text-gold' : 'text-charcoal'}`}>
                      AED {entry.highest.toLocaleString()}
                    </td>
                    <td className="px-2 py-2.5 text-center text-taupe">{entry.count}</td>
                    <td className="px-4 py-2.5 text-right text-taupe/70">{timeAgo(entry.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leaderboard.length > 5 && (
            <button
              onClick={() => setShowLeaderboard(v => !v)}
              className="w-full py-2.5 text-taupe text-[11px] font-semibold hover:text-charcoal transition-colors border-t border-taupe/10 bg-taupe/3 hover:bg-taupe/8 flex items-center justify-center gap-1"
            >
              {showLeaderboard ? 'Show less ▲' : `View full leaderboard (${leaderboard.length}) ▼`}
            </button>
          )}
        </div>
      )}

      {/* Ticket Payment Modal */}
      {showPaymentModal && createPortal(
        <BuyTicketModal
          auction={auction} product={product} wallet={wallet}
          onClose={() => setShowPaymentModal(false)}
          onCardPayment={onCardPayment}
        />,
        document.body
      )}
    </div>
  )
}

// ── Right: Pending/Upcoming Auction Panel ────────────────────────────
function PendingAuctionPanel({ auction, product }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user }   = useSelector(s => s.auth)
  const { wallet } = useSelector(s => s.wallet)
  const { loading, userHasTicket } = useSelector(s => s.auctions)

  const [msg, setMsg]                       = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (location.state?.autoTicket) {
      if (!user) { navigate('/login'); return }
      setShowPaymentModal(true)
      window.history.replaceState({}, '')
    }
  }, [location.state?.autoTicket, user])

  useEffect(() => { if (user) dispatch(fetchWallet()) }, [user])

  const walletBal  = wallet ? Number(wallet.balance) : 0
  const maxBidAmount = auction.maxBidAmount ? Number(auction.maxBidAmount) : null
  const ticketsSold  = auction.ticketsSold  || 0
  const ticketTarget = auction.ticketTarget || 0
  const ticketPct    = ticketTarget > 0 ? Math.min((ticketsSold / ticketTarget) * 100, 100) : 0
  const buyNowPrice  = product.buyNowPrice ? Number(product.buyNowPrice) : null
  const buyNowAvail  = !!(buyNowPrice && auction.buyNowAvailable && auction.status !== 'ACTIVE')
  const pad = n => String(n).padStart(2, '0')

  const countdown = useCountdown(auction.scheduledStartTime)
  const countdownStr = `${pad(countdown.dd)}:${pad(countdown.hh)}:${pad(countdown.mm)}:${pad(countdown.ss)}`

  const doAction = async (fn, ...args) => {
    setMsg(null)
    try {
      await dispatch(fn(...args)).unwrap()
      setMsg({ type: 'success', text: 'Done!' })
    } catch (e) {
      setMsg({ type: 'error', text: typeof e === 'string' ? e : e?.message || 'Something went wrong' })
    }
  }

  const onTicket = () => {
    if (!user) { navigate('/login'); return }
    setShowPaymentModal(true)
  }
  const onCardPayment = () => { setShowPaymentModal(false); navigate('/checkout', { state: { type: 'ticket', product, auction } }) }
  const onBuyNow = () => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { type: 'buynow', product, auction } })
  }

  useEffect(() => {
    const handlePurchaseRequest = event => {
      if (event.detail === 'ticket') onTicket()
      if (event.detail === 'buyNow' && buyNowAvail) onBuyNow()
    }
    window.addEventListener(PRODUCT_PURCHASE_EVENT, handlePurchaseRequest)
    return () => window.removeEventListener(PRODUCT_PURCHASE_EVENT, handlePurchaseRequest)
  })

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 text-gold text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
          <IconCalendar className="w-3.5 h-3.5" />
          Upcoming Auction
        </span>
        <span className="text-charcoal text-xs font-semibold tabular-nums">
          Starts in <span className="text-gold font-bold">{countdownStr}</span>
        </span>
      </div>

      {/* Two price boxes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald rounded-xl px-4 py-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-gold/80 text-[9px] font-bold tracking-[0.14em] uppercase">
            <IconGavel className="w-3.5 h-3.5" />
            Max Bid Amount
          </div>
          <p className="text-ivory text-xl font-bold font-display leading-none">
            {maxBidAmount ? `AED ${maxBidAmount.toLocaleString()}` : '—'}
          </p>
          <span className="text-gold/50 text-[10px]">◆</span>
        </div>

        <div className={`border rounded-xl px-4 py-4 flex flex-col gap-1.5 transition-opacity ${
          !buyNowPrice ? 'invisible' :
          !buyNowAvail ? 'border-taupe/15 opacity-40' :
          'border-gold/35 bg-white'
        }`}>
          <div className="flex items-center gap-1.5 text-taupe text-[9px] font-bold tracking-[0.14em] uppercase">
            <IconBag className="w-3.5 h-3.5" />
            Buy Now Price
          </div>
          <p className={`text-xl font-bold font-display leading-none ${buyNowAvail ? 'text-gold' : 'text-taupe'}`}>
            {buyNowPrice ? `AED ${buyNowPrice.toLocaleString()}` : '—'}
          </p>
          <span className="text-gold/40 text-[10px]">◆</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="border border-taupe/15 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-taupe/15">
          <div className="px-3 py-3 flex flex-col items-center gap-1 text-center">
            <p className="text-taupe text-[8px] font-bold tracking-wider uppercase leading-tight">Ticket Price</p>
            <p className="text-gold font-bold text-sm leading-none">AED {Number(auction.ticketPrice || 0).toLocaleString()}</p>
            <p className="text-taupe/60 text-[9px] leading-none">One ticket per user</p>
          </div>
          <div className="px-3 py-3 flex flex-col items-center gap-1 text-center">
            <p className="text-taupe text-[8px] font-bold tracking-wider uppercase leading-tight">Tickets Sold</p>
            <p className="text-charcoal font-bold text-sm leading-none">{ticketsSold}/{ticketTarget}</p>
            <div className="w-full h-1 bg-taupe/20 rounded-full overflow-hidden my-0.5">
              <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${ticketPct}%` }} />
            </div>
            <p className="text-gold text-[9px] font-semibold leading-none">{ticketPct.toFixed(0)}% sold</p>
          </div>
          <div className="px-3 py-3 flex flex-col items-center gap-1 text-center">
            <p className="text-taupe text-[8px] font-bold tracking-wider uppercase leading-tight">Auction Starts In</p>
            <div className="flex items-center gap-0.5">
              {[[pad(countdown.dd),'DD'],[pad(countdown.hh),'HH'],[pad(countdown.mm),'MM'],[pad(countdown.ss),'SS']].map(([val, unit], i) => (
                <div key={unit} className="flex items-center">
                  {i > 0 && <span className="text-gold text-xs mx-px">:</span>}
                  <div className="flex flex-col items-center">
                    <span className="text-charcoal font-bold text-xs leading-none tabular-nums">{val}</span>
                    <span className="text-taupe text-[7px] leading-none mt-0.5">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket purchased */}
      {user && userHasTicket && (
        <div className="flex items-center gap-2 bg-emerald/10 border border-emerald/25 rounded-xl px-4 py-3">
          <span className="w-5 h-5 bg-emerald rounded-full flex items-center justify-center flex-shrink-0">
            <IconCheck className="w-3 h-3 text-ivory" />
          </span>
          <div>
            <p className="text-emerald text-xs font-bold uppercase tracking-wider leading-tight">Ticket Purchased</p>
            <p className="text-emerald/70 text-[10px] leading-none">You're in the auction</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {msg && (
        <div className={`text-sm rounded-lg px-4 py-3 ${msg.type === 'success' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-burgundy/10 text-burgundy border border-burgundy/20'}`}>
          {msg.text}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex items-center gap-2">
        {user && !userHasTicket ? (
          <button
            onClick={onTicket}
            disabled={loading}
            className="flex-1 bg-emerald text-ivory rounded-xl py-3.5 px-4 flex flex-col items-center btn-shimmer hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <IconTicket className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-sm tracking-wider uppercase">{loading ? 'Processing…' : 'Buy Auction Ticket'}</span>
            </div>
            <span className="text-ivory/60 text-xs mt-0.5">AED {Number(auction.ticketPrice || 0).toLocaleString()} entry</span>
          </button>
        ) : user && userHasTicket ? (
          <div className="flex-1 bg-emerald/20 border border-emerald/30 text-emerald rounded-xl py-3.5 px-4 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <IconTicket className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-sm tracking-wider uppercase">Ticket Purchased</span>
            </div>
            <span className="text-emerald/60 text-xs mt-0.5">You're in the auction</span>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-emerald text-ivory rounded-xl py-3.5 px-4 flex flex-col items-center btn-shimmer hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <IconTicket className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-sm tracking-wider uppercase">Buy Auction Ticket</span>
            </div>
            <span className="text-ivory/60 text-xs mt-0.5">Sign in to join</span>
          </button>
        )}

        <div className="w-9 h-9 rounded-full border border-taupe/25 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-taupe text-[9px] font-semibold">OR</span>
        </div>

        {buyNowAvail ? (
          <button
            onClick={onBuyNow}
            className="flex-1 bg-gold-gradient text-charcoal rounded-xl py-3.5 px-4 flex flex-col items-center btn-shimmer hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <IconBag className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold text-sm tracking-wider uppercase">Buy Now</span>
            </div>
            <span className="text-charcoal/55 text-xs mt-0.5">Get it instantly</span>
          </button>
        ) : (
          <div className="flex-1 bg-taupe/10 rounded-xl py-3.5 px-4 flex flex-col items-center opacity-40 cursor-not-allowed">
            <div className="flex items-center gap-2">
              <IconBag className="w-4 h-4 flex-shrink-0 text-taupe" />
              <span className="font-bold text-sm tracking-wider uppercase text-taupe">Buy Now</span>
            </div>
            <span className="text-taupe/60 text-xs mt-0.5">Unavailable</span>
          </div>
        )}
      </div>

      {/* Trust */}
      <div className="flex items-center justify-center gap-1.5 text-taupe/40 text-xs pt-1">
        <IconShield className="w-3.5 h-3.5 flex-shrink-0" />
        Secure. Transparent. Trusted.
      </div>

      {/* Ticket Payment Modal */}
      {showPaymentModal && createPortal(
        <BuyTicketModal
          auction={auction} product={product} wallet={wallet}
          onClose={() => setShowPaymentModal(false)}
          onCardPayment={onCardPayment}
        />,
        document.body
      )}
    </div>
  )
}

// ── Buy Now Completed Panel ───────────────────────────────────────────
function BuyNowCompletedPanel({ auction, product }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { wallet } = useSelector(s => s.wallet)
  useEffect(() => { if (user) dispatch(fetchWallet()) }, [user])

  const currency = auction.currency || 'AED'
  const buyNowAmount = product.buyNowPrice ? Number(product.buyNowPrice) : 0
  const ticketPrice = Number(auction.ticketPrice || 0)
  const isCurrentUserBuyer = user && user.id === auction.winnerId

  const auctionCredit = useMemo(() => {
    if (!wallet?.transactions) return 0
    return wallet.transactions
      .filter(t => t.reason === 'AUCTION_LOSS_CREDIT' && t.type === 'CREDIT' && t.note?.includes(`#${auction.id}`))
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [wallet, auction.id])

  const bonusCredits = Math.max(0, auctionCredit - ticketPrice)

  const completedAt = auction.endTime
    ? new Date(auction.endTime).toLocaleString('en-AE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }) + ' (GST)'
    : '—'

  const ticketsSoldStr = `${auction.ticketsSold || 0} / ${auction.ticketTarget || 0}`
  const durationDays = auction.actualStartTime && auction.endTime
    ? Math.ceil((new Date(auction.endTime) - new Date(auction.actualStartTime)) / 86400000)
    : null

  return (
    <div className="space-y-4">
      {/* Dark green banner */}
      <div className="bg-emerald rounded-xl px-5 py-5 flex flex-col items-center gap-2 text-center">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-gold">
          <IconBag className="w-6 h-6 text-gold" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
            <IconCheck className="w-3 h-3 text-charcoal" />
          </span>
        </div>
        <p className="text-gold font-bold tracking-widest uppercase text-sm mt-1">Instant Buy Completed</p>
        <p className="text-ivory/70 text-xs">This item was secured before the live auction started.</p>
      </div>

      {/* Buyer info block */}
      <div className="flex flex-col items-center gap-1.5 py-2">
        <div className="w-16 h-16 rounded-full bg-taupe/10 border border-taupe/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-taupe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <p className="text-taupe text-[10px] font-bold tracking-widest uppercase">Buyer</p>
        <p className="text-emerald font-display font-bold text-2xl">{auction.winnerName || '—'}</p>
        <p className="text-taupe text-sm">Instant Buy Amount</p>
        <p className="text-emerald font-bold text-3xl">{currency} {buyNowAmount.toLocaleString()}</p>
        <div className="flex items-center gap-1.5 text-taupe text-xs">
          <IconCalendar className="w-3.5 h-3.5" />
          Completed on {completedAt}
        </div>
      </div>

      {/* Credit/refund card — shown only for logged-in non-buyers */}
      {user && !isCurrentUserBuyer && (
        <div className="border border-taupe/15 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">🎁</span>
            <div>
              <p className="text-emerald font-semibold text-sm">Thank you for your interest!</p>
              <p className="text-taupe text-xs mt-0.5">This item was secured through Instant Buy before the live auction started.</p>
            </div>
          </div>
          <div className="border-t border-taupe/10" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-taupe/10 border border-taupe/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-taupe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0H3" />
              </svg>
            </div>
            <p className="text-charcoal text-sm flex-1">Full ticket price has been returned to your <strong>Wallet Balance</strong>.</p>
            <p className="text-charcoal font-bold text-sm flex-shrink-0">{currency} {ticketPrice.toLocaleString()}</p>
          </div>
          {bonusCredits > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <p className="text-charcoal text-sm flex-1">As a thank you for joining early, <strong>extra Reward Credits</strong> have been added for your future <strong>auction tickets</strong>.</p>
              <p className="text-gold font-bold text-sm flex-shrink-0">+{currency} {bonusCredits.toLocaleString()}</p>
            </div>
          )}
          <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <IconInfo className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <p className="text-taupe text-xs">If you prefer to withdraw the refunded ticket amount, you can submit a refund request from My Requests.</p>
            </div>
            <button
              onClick={() => navigate('/my-requests')}
              className="flex-shrink-0 text-xs border border-taupe/30 text-taupe rounded-lg px-3 py-1.5 hover:border-taupe/60 transition-colors"
            >
              Go to My Requests →
            </button>
          </div>
        </div>
      )}

      {/* Auction Summary */}
      <div className="space-y-2">
        <p className="text-emerald text-[10px] font-bold tracking-widest uppercase">Auction Summary</p>
        <div className="border border-taupe/15 rounded-xl divide-y divide-taupe/10">
          {[
            { label: 'Auction Type', value: auction.auctionType || '—' },
            { label: 'Ticket Price', value: `${currency} ${ticketPrice.toLocaleString()}` },
            { label: 'Tickets Sold', value: ticketsSoldStr },
            { label: 'Auction Duration', value: durationDays != null ? `${durationDays} day${durationDays !== 1 ? 's' : ''}` : '—' },
            { label: 'Maximum Bid Amount', value: auction.maxBidAmount ? `${currency} ${Number(auction.maxBidAmount).toLocaleString()}` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5">
              <span className="text-taupe text-xs">{label}</span>
              <span className="text-charcoal text-xs font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What Happens Next? */}
      <div className="space-y-2">
        <p className="text-emerald text-[10px] font-bold tracking-widest uppercase">What Happens Next?</p>
        <div className="border border-taupe/15 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">🚚</span>
          <p className="text-charcoal text-xs flex-1">The item will be prepared and delivered with full authentication and secure packaging.</p>
        </div>
        <button className="text-xs border border-taupe/30 text-taupe rounded-lg px-4 py-2 hover:border-taupe/60 transition-colors">
          Learn More About Delivery
        </button>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/auctions')}
        className="w-full border border-taupe/30 text-taupe rounded-xl py-3 text-sm hover:border-taupe/60 transition-colors flex items-center justify-center gap-2"
      >
        <IconChevronLeft className="w-4 h-4" />
        Back to All Auctions
      </button>
    </div>
  )
}

// ── Auction Completed Panel ───────────────────────────────────────────
function AuctionCompletedPanel({ auction, bids, product }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { wallet } = useSelector(s => s.wallet)
  useEffect(() => { if (user) dispatch(fetchWallet()) }, [user])

  const currency = auction.currency || 'AED'
  const isWinner = user && user.id === auction.winnerId
  const isClosed = auction.status === 'CLOSED'
  const isSold = auction.status === 'SOLD'
  const finalOffer = Number(auction.currentHighestBid || 0)
  const ticketPrice = Number(auction.ticketPrice || 0)

  const leaderboard = useMemo(() => {
    if (!bids || bids.length === 0) return []
    const map = {}
    bids.forEach(b => {
      const key = b.bidderId || b.bidderName || 'anon'
      const amount = Number(b.amount)
      if (!map[key]) {
        map[key] = { name: b.bidderName || 'Anonymous', highest: amount, count: 0, lastAt: b.createdAt }
      }
      map[key].count++
      if (amount > map[key].highest) map[key].highest = amount
      if (b.createdAt && (!map[key].lastAt || new Date(b.createdAt) > new Date(map[key].lastAt))) {
        map[key].lastAt = b.createdAt
      }
    })
    return Object.values(map).sort((a, b) => b.highest - a.highest)
  }, [bids])

  const [showAllBids, setShowAllBids] = useState(false)
  const visibleLeaderboard = showAllBids ? leaderboard : leaderboard.slice(0, 5)

  const auctionCredit = useMemo(() => {
    if (!wallet?.transactions) return 0
    return wallet.transactions
      .filter(t => t.reason === 'AUCTION_LOSS_CREDIT' && t.type === 'CREDIT' && t.note?.includes(`#${auction.id}`))
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [wallet, auction.id])

  const completedAt = auction.endTime
    ? new Date(auction.endTime).toLocaleString('en-AE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }) + ' (GST)'
    : '—'

  const ticketsSoldStr = `${auction.ticketsSold || 0} / ${auction.ticketTarget || 0}`
  const durationDays = auction.actualStartTime && auction.endTime
    ? Math.ceil((new Date(auction.endTime) - new Date(auction.actualStartTime)) / 86400000)
    : null

  const rankColors = ['text-gold', 'text-taupe', 'text-[#cd7f32]']
  const rowTints = ['bg-gold/5', 'bg-taupe/5', 'bg-[#cd7f32]/5']

  return (
    <div className="space-y-4">
      {/* Dark green banner */}
      <div className="bg-emerald rounded-xl px-5 py-5 flex flex-col items-center gap-2 text-center">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <IconCheck className="w-5 h-5 text-white" />
        </div>
        <p className="text-ivory font-bold tracking-widest uppercase text-sm mt-1">Auction Completed</p>
        <p className="text-ivory/70 text-xs">This auction has successfully ended.</p>
      </div>

      {/* Winner info block */}
      {isSold && auction.winnerName ? (
        <div className="flex flex-col items-center gap-1.5 py-2">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-taupe text-[10px] font-bold tracking-widest uppercase">Winner</p>
          <p className="text-emerald font-display font-bold text-2xl">{auction.winnerName}</p>
          <span className="text-gold text-xs">◆</span>
          <p className="text-taupe text-sm">Final Winning Offer</p>
          <p className="text-charcoal font-bold text-3xl">{currency} {finalOffer.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-taupe text-xs">
            <IconCalendar className="w-3.5 h-3.5" />
            Completed on {completedAt}
          </div>
        </div>
      ) : isClosed ? (
        <div className="border border-taupe/15 rounded-xl px-5 py-4 text-center">
          <p className="text-taupe text-sm">This auction closed without a winning bid.</p>
        </div>
      ) : null}

      {/* Participation reward card — for logged-in non-winners */}
      {user && !isWinner && !isClosed && (
        <div className="border border-taupe/15 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🎁</span>
            </div>
            <div>
              <p className="text-emerald font-semibold text-sm">Thank you for participating!</p>
              <p className="text-taupe text-xs mt-0.5">As you did not win this auction, reward credits have been added to your wallet.</p>
            </div>
          </div>
          {auctionCredit > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-taupe text-xs">Reward Credits Added</span>
              <span className="text-emerald font-bold text-2xl">{currency} {auctionCredit.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Participation reward for closed auction */}
      {user && !isWinner && isClosed && (
        <div className="border border-taupe/15 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-taupe/10 border border-taupe/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🎁</span>
            </div>
            <div>
              <p className="text-emerald font-semibold text-sm">Your ticket has been refunded.</p>
              <p className="text-taupe text-xs mt-0.5">Your ticket price has been credited back to your wallet as Reward Credits.</p>
            </div>
          </div>
          {auctionCredit > 0 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-taupe text-xs">Reward Credits Added</span>
              <span className="text-emerald font-bold text-2xl">{currency} {auctionCredit.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Winner congratulations */}
      {user && isWinner && isSold && (
        <div className="border border-emerald/30 bg-emerald/5 rounded-xl p-4 space-y-1">
          <p className="text-emerald font-semibold text-sm">🎉 Congratulations, you won!</p>
          <p className="text-taupe text-xs">Our team will contact you to complete payment and delivery arrangements.</p>
        </div>
      )}

      {/* Final Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="space-y-2">
          <p className="text-emerald text-[10px] font-bold tracking-widest uppercase">Final Leaderboard</p>
          <div className="border border-taupe/15 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-taupe/15">
                  <th className="text-emerald uppercase text-[9px] tracking-wider font-bold px-3 py-2 text-left">Rank</th>
                  <th className="text-emerald uppercase text-[9px] tracking-wider font-bold px-3 py-2 text-left">Bidder</th>
                  <th className="text-emerald uppercase text-[9px] tracking-wider font-bold px-3 py-2 text-right">Final Offer</th>
                  <th className="text-emerald uppercase text-[9px] tracking-wider font-bold px-3 py-2 text-center hidden sm:table-cell">Offers</th>
                  <th className="text-emerald uppercase text-[9px] tracking-wider font-bold px-3 py-2 text-right hidden sm:table-cell">Last Offer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-taupe/10">
                {visibleLeaderboard.map((entry, idx) => {
                  const rank = idx + 1
                  const isTopThree = rank <= 3
                  return (
                    <tr key={entry.name + idx} className={isTopThree ? rowTints[idx] : ''}>
                      <td className={`px-3 py-2 font-bold ${isTopThree ? rankColors[idx] : 'text-taupe'}`}>#{rank}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs ${rank === 1 ? 'text-charcoal font-semibold' : 'text-taupe'}`}>{entry.name}</span>
                          {rank === 1 && (
                            <span className="bg-emerald/10 text-emerald text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald/20">Winner</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${rank === 1 ? 'text-gold' : 'text-charcoal'}`}>
                        {currency} {entry.highest.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-center text-taupe hidden sm:table-cell">{entry.count}</td>
                      <td className="px-3 py-2 text-right text-taupe hidden sm:table-cell">{entry.lastAt ? timeAgo(entry.lastAt) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {leaderboard.length > 5 && (
              <button
                onClick={() => setShowAllBids(v => !v)}
                className="w-full text-center text-xs text-taupe py-2 border-t border-taupe/10 hover:text-emerald transition-colors"
              >
                {showAllBids ? 'Show less ▲' : `View full bids history ↓`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auction Summary */}
      <div className="space-y-2">
        <p className="text-emerald text-[10px] font-bold tracking-widest uppercase">Auction Summary</p>
        <div className="border border-taupe/15 rounded-xl divide-y divide-taupe/10">
          {[
            { label: 'Auction Type', value: auction.auctionType || '—' },
            { label: 'Ticket Price', value: `${currency} ${ticketPrice.toLocaleString()}` },
            { label: 'Tickets Sold', value: ticketsSoldStr },
            { label: 'Auction Duration', value: durationDays != null ? `${durationDays} day${durationDays !== 1 ? 's' : ''}` : '—' },
            { label: 'Maximum Bid Amount', value: auction.maxBidAmount ? `${currency} ${Number(auction.maxBidAmount).toLocaleString()}` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-4 py-2.5">
              <span className="text-taupe text-xs">{label}</span>
              <span className="text-charcoal text-xs font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What Happens Next? */}
      <div className="space-y-2">
        <p className="text-emerald text-[10px] font-bold tracking-widest uppercase">What Happens Next?</p>
        <div className="border border-taupe/15 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">{isSold ? '📦' : '💳'}</span>
          <p className="text-charcoal text-xs flex-1">
            {isSold
              ? 'The winner will be contacted by our team to complete payment and delivery arrangements.'
              : 'Ticket prices have been refunded as Reward Credits to all participants.'}
          </p>
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/auctions')}
        className="w-full border border-taupe/30 text-taupe rounded-xl py-3 text-sm hover:border-taupe/60 transition-colors flex items-center justify-center gap-2"
      >
        <IconChevronLeft className="w-4 h-4" />
        Back to All Auctions
      </button>
    </div>
  )
}

// ── Buy Now Only (no auction) ─────────────────────────────────────────
function BuyNowOnlyPanel({ product }) {
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  const onBuyNow = () => {
    if (!user) { navigate('/login'); return }
    navigate('/checkout', { state: { type: 'buynow', product } })
  }

  return (
    <div className="space-y-4">
      <div className="border border-gold/35 rounded-xl px-5 py-5 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-taupe text-[10px] font-bold tracking-[0.12em] uppercase">
          <IconBag className="w-3.5 h-3.5" />
          Buy Now Price
        </div>
        <p className="text-gold text-3xl font-bold font-display">AED {Number(product.buyNowPrice).toLocaleString()}</p>
        <span className="text-gold/40 text-[10px]">◆</span>
      </div>

      <button
        onClick={onBuyNow}
        className="w-full bg-gold-gradient text-charcoal font-bold py-4 rounded-xl btn-shimmer hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <IconBag className="w-4 h-4" />
        Buy Now — AED {Number(product.buyNowPrice).toLocaleString()}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-taupe/40 text-xs">
        <IconShield className="w-3.5 h-3.5 flex-shrink-0" />
        Secure. Transparent. Trusted.
      </div>
    </div>
  )
}

// ── Buy Flow Infographic ────────────────────────────────────────────
function DownArrow() {
  return (
    <div className="flex justify-center py-1.5">
      <svg className="w-4 h-4 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
      </svg>
    </div>
  )
}

function StepCard({ step, title, children, accent = 'taupe' }) {
  const accentClasses = accent === 'emerald'
    ? 'border-emerald/25'
    : accent === 'gold'
    ? 'border-gold/30'
    : 'border-taupe/15'
  return (
    <div className={`bg-white rounded-xl border ${accentClasses} p-4 h-full`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-charcoal text-ivory text-[10px] font-bold flex items-center justify-center flex-shrink-0">{step}</span>
        <p className="text-charcoal text-[11px] font-bold uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  )
}

function BuyFlowInfographic({ product, auction }) {
  const ticketPrice = auction?.ticketPrice ? Number(auction.ticketPrice) : null
  const buyNowPrice = product.buyNowPrice ? Number(product.buyNowPrice) : null
  const hasBuyNow   = !!buyNowPrice

  const startPurchase = type => {
    document.getElementById('auction-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.dispatchEvent(new CustomEvent(PRODUCT_PURCHASE_EVENT, { detail: type }))
  }

  const NOTES = [
    { icon: <IconTicket className="w-4 h-4" />, text: 'One ticket per user, per auction.' },
    { icon: <IconCalendar className="w-4 h-4" />, text: 'Buy a ticket before or during the live auction.' },
    { icon: <IconBag className="w-4 h-4" />, text: 'Instant Buy is only available before bidding starts.' },
    { icon: <IconShield className="w-4 h-4" />, text: 'All payments are secure and encrypted.' },
  ]

  return (
    <div className="border border-gold/20 rounded-2xl p-5 sm:p-7 bg-[#fbf8f2]">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-px w-10 bg-gold/50" />
          <p className="text-emerald font-display font-semibold text-lg sm:text-xl">How Buying This Item Works</p>
          <div className="h-px w-10 bg-gold/50" />
        </div>
        <p className="text-taupe text-xs">One ticket gives you access to bid — or skip ahead and buy it instantly.</p>
      </div>

      {/* STEP 1 */}
      <div className="max-w-xs mx-auto">
        <StepCard step={1} title="Ticket Details">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconTicket className="w-4 h-4 text-gold flex-shrink-0" />
              <span className="text-charcoal text-xs font-semibold">Review auction &amp; ticket info</span>
            </div>
            <div className="flex items-center justify-between text-[11px] border-t border-taupe/10 pt-2">
              <span className="text-taupe">Ticket Price</span>
              <span className="text-charcoal font-bold">{ticketPrice ? `AED ${ticketPrice.toLocaleString()}` : '—'}</span>
            </div>
          </div>
        </StepCard>
      </div>
      <p className="text-center text-taupe/70 text-[11px] mt-2">Review the auction and ticket details before proceeding.</p>

      <DownArrow />

      {/* STEP 2 — branch */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StepCard step={2} title="Buy Auction Ticket" accent="emerald">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconTicket className="w-4 h-4 text-emerald flex-shrink-0" />
              <span className="text-charcoal text-xs font-semibold">Join the live auction &amp; place offers</span>
            </div>
            <p className="text-taupe text-[11px] leading-relaxed">Pay with Wallet, Reward Credits, or Card.</p>
          </div>
        </StepCard>

        {/* OR divider */}
        <span className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#fbf8f2] border border-gold/30 text-gold text-[10px] font-bold items-center justify-center">
          OR
        </span>

        <StepCard step={2} title="Buy It Now" accent="gold">
          {hasBuyNow ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconBag className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-charcoal text-xs font-semibold">Skip the auction, secure it immediately</span>
              </div>
              <div className="flex items-center justify-between text-[11px] border-t border-taupe/10 pt-2">
                <span className="text-taupe">Buy Now Price</span>
                <span className="text-gold font-bold">AED {buyNowPrice.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <IconBag className="w-4 h-4 text-taupe/40 flex-shrink-0" />
              <span className="text-taupe text-xs">Not available for this item</span>
            </div>
          )}
        </StepCard>
      </div>
      <p className="text-center text-taupe/70 text-[11px] mt-2">Choose to join the live auction, or buy the item outright.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <DownArrow />
        <DownArrow />
      </div>

      {/* STEP 3 — outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StepCard step={3} title="Ticket Purchased" accent="emerald">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald/15 flex items-center justify-center flex-shrink-0">
              <IconCheck className="w-3 h-3 text-emerald" />
            </span>
            <span className="text-charcoal text-xs">You're ready to place offers when the auction goes live.</span>
          </div>
        </StepCard>
        <StepCard step={3} title="Item Secured" accent="gold">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
              <IconCheck className="w-3 h-3 text-gold" />
            </span>
            <span className="text-charcoal text-xs">Purchase confirmed — no bidding needed.</span>
          </div>
        </StepCard>
      </div>
      <p className="text-center text-taupe/70 text-[11px] mt-2">Either way, you're all set.</p>

      {/* Important notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7 pt-6 border-t border-gold/15">
        {NOTES.map((n, i) => (
          <div key={i} className="flex items-center gap-2.5 text-taupe">
            <span className="text-gold flex-shrink-0">{n.icon}</span>
            <span className="text-[11px] leading-snug">{n.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
        <button
          onClick={() => startPurchase('ticket')}
          className="flex-1 bg-emerald text-ivory font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-emerald/90 transition-colors"
        >
          Buy Auction Ticket
        </button>
        {hasBuyNow && (
          <button
            onClick={() => startPurchase('buyNow')}
            className="flex-1 bg-gold text-charcoal font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Buy It Now
          </button>
        )}
      </div>
    </div>
  )
}

// ── Product Detail Page ───────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id }       = useParams()
  const dispatch     = useDispatch()
  const { selected: product, loading } = useSelector(s => s.products)
  const { bids, selected: liveAuction } = useSelector(s => s.auctions)
  const { user }     = useSelector(s => s.auth)

  const [activeImg, setActiveImg]       = useState(0)
  const [zoomOpen, setZoomOpen]         = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const auctionId = product?.auction?.id
  const auction   = (liveAuction?.id === auctionId ? liveAuction : null) ?? product?.auction ?? null

  useEffect(() => {
    if (id && id !== 'undefined') dispatch(fetchProductById(id))
    return () => { dispatch(clearSelected()); dispatch(clearAuction()) }
  }, [id])

  useEffect(() => {
    if (auctionId) {
      dispatch(fetchAuctionById(auctionId))
      dispatch(fetchBids(auctionId))
      if (user) dispatch(checkMyTicket(auctionId))
    }
  }, [auctionId, user])

  if (loading || !product) return <Loader text="Loading product…" />

  const images = Array.from(new Set([
    ...(product.imageUrls || []),
    ...(product.images || []).map(image => typeof image === 'string' ? image : image?.imageUrl || image?.url),
  ].filter(Boolean))).map(imageUrl => ({ imageUrl }))
  const hasAuction = !!auction
  const isActive   = auction?.status === 'ACTIVE'
  const isPending  = auction?.status === 'PENDING'
  const isSold     = auction?.status === 'SOLD'
  const isClosed   = auction?.status === 'CLOSED'

  const inclusions = [
    product.includesBox             && 'Original Box',
    product.includesDustBag         && 'Dust Bag',
    product.includesAuthCard        && 'Auth Card',
    product.includesWarrantyCard    && 'Warranty Card',
    product.includesOriginalReceipt && 'Original Receipt',
  ].filter(Boolean)

  const summaryFields = [
    { field: 'brand',    label: 'Brand',     value: product.brand },
    { field: 'model',    label: 'Model',     value: product.modelName },
    { field: 'material', label: 'Material',  value: product.material },
    { field: 'year',     label: 'Year',      value: product.yearOfManufacture },
    { field: 'serial',   label: 'Serial/Ref',value: product.serialNumber },
    { field: 'origin',   label: 'Origin',    value: product.sourceCountry },
    { field: 'condition',label: 'Condition', value: GRADE_LABEL[product.conditionGrade] || product.conditionGrade },
  ].filter(f => f.value)

  const descMaxLen = 200
  const descFull   = product.description || ''
  const descShort  = descFull.length > descMaxLen ? descFull.slice(0, descMaxLen) + '…' : descFull
  const descText   = descExpanded ? descFull : descShort

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setActiveImg(i => (i + 1) % images.length)

  // Breadcrumb auction label
  const auctionBreadcrumb =
    isActive  ? 'LIVE AUCTION' :
    isPending ? 'UPCOMING AUCTION' :
    isSold    ? 'SOLD' :
    isClosed  ? 'ENDED' :
    hasAuction ? 'AUCTION' : null

  return (
    <div className="min-h-screen bg-[#faf6ef]">

      {/* Image zoom lightbox */}
      {zoomOpen && images[activeImg] && (
        <ImageZoom
          imageUrl={images[activeImg].imageUrl}
          alt={`${product.name} - image ${activeImg + 1}`}
          onClose={() => setZoomOpen(false)}
          onPrev={prevImg}
          onNext={nextImg}
          hasMultiple={images.length > 1}
        />
      )}

      {/* Breadcrumb */}
      <div className="border-b border-taupe/10 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-taupe">
          <a href="/" className="hover:text-gold transition-colors">Home</a>
          <span className="text-taupe/30">›</span>
          <a href="/auctions" className="hover:text-gold transition-colors">Auctions</a>
          {auctionBreadcrumb && (
            <>
              <span className="text-taupe/30">›</span>
              <span className={`font-bold ${isActive ? 'text-emerald' : 'text-gold'}`}>{auctionBreadcrumb}</span>
            </>
          )}
          <span className="text-taupe/30">›</span>
          <span className="text-charcoal truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Balanced reference layout: gallery and auction controls share the page evenly. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.03fr_0.97fr] gap-5 xl:gap-7 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-3 animate-fade-up">

            {/* Brand / Title / Badges (at top of left column) */}
            <div className="rounded-2xl border border-taupe/15 bg-[#faf6ef] p-4 sm:p-5 shadow-sm">
              <p className="text-gold text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] mb-1.5">{product.brand}</p>
              <h1 className="font-display text-[#171717] text-2xl sm:text-[30px] font-semibold leading-[1.12]">{product.name}</h1>
              {product.modelName && (
                <p className="text-[#5f5a54] text-xs mt-1.5 font-medium">{product.modelName}</p>
              )}
              {/* Badges row */}
              <div className="flex flex-wrap gap-2 mt-3">
                {product.authenticationStatus && (
                  <span className={`text-xs border px-3 py-1.5 rounded-full font-medium ${AUTH_COLOR[product.authenticationStatus] || 'text-taupe border-taupe/15'}`}>
                    {product.authenticationStatus === 'AUTHENTICATED' ? '✓ ' : ''}{product.authenticationStatus.replace(/_/g, ' ')}
                  </span>
                )}
                {product.conditionGrade && (
                  <span className="text-xs bg-taupe/10 border border-taupe/15 text-taupe px-3 py-1.5 rounded-full">
                    {GRADE_LABEL[product.conditionGrade] || product.conditionGrade}
                  </span>
                )}
                {product.sourceCountry && (
                  <span className="text-xs bg-taupe/10 border border-taupe/15 text-taupe px-3 py-1.5 rounded-full">
                    From {product.sourceCountry}
                  </span>
                )}
                {product.sold && (
                  <span className="text-xs bg-burgundy/10 text-burgundy border border-burgundy/20 px-3 py-1.5 rounded-full font-medium">Sold</span>
                )}
              </div>

            {/* Main image + navigation arrows */}
            <div className="relative group mt-4">
              <div
                className="h-[360px] sm:h-[430px] lg:h-[440px] xl:h-[470px] bg-[#fbfaf8] rounded-xl overflow-hidden cursor-zoom-in"
                onClick={() => images[activeImg] && setZoomOpen(true)}
              >
                {images[activeImg] ? (
                  <>
                    <img
                      src={images[activeImg].imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-[1.015] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-almost-black/60 backdrop-blur-sm text-ivory text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <IconZoom className="w-3.5 h-3.5" />
                        Zoom
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-taupe/20 text-7xl font-display">◆</span>
                  </div>
                )}
              </div>

              {/* Arrow navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); prevImg() }}
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full shadow-md flex items-center justify-center opacity-100 transition-opacity hover:bg-white border border-taupe/15 z-10"
                  >
                    <IconChevronLeft className="w-5 h-5 text-charcoal" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); nextImg() }}
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full shadow-md flex items-center justify-center opacity-100 transition-opacity hover:bg-white border border-taupe/15 z-10"
                  >
                    <IconChevronRight className="w-5 h-5 text-charcoal" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-almost-black/50 backdrop-blur-sm text-ivory text-[10px] px-2.5 py-1 rounded-full tabular-nums">
                    {activeImg + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1" aria-label="Product image gallery">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    aria-label={`View product image ${i + 1} of ${images.length}`}
                    className={`flex-shrink-0 w-[72px] h-[60px] sm:w-[84px] sm:h-[68px] rounded-lg overflow-hidden border transition-all duration-200 ${
                      i === activeImg
                        ? 'border-emerald shadow-sm ring-1 ring-emerald/20'
                        : 'border-taupe/20 hover:border-gold opacity-80 hover:opacity-100'
                    }`}>
                    <img src={img.imageUrl} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-contain bg-[#fbfaf8]" />
                  </button>
                ))}
              </div>
            )}

            {/* INCLUSIONS chips */}
            {inclusions.length > 0 && (
              <div className="border-t border-taupe/15 mt-4 pt-3">
                <p className="text-taupe text-[10px] font-bold uppercase tracking-widest mb-3">Inclusions</p>
                <div className="flex flex-wrap gap-2">
                  {inclusions.map(inc => (
                    <span
                      key={inc}
                      className="inline-flex items-center gap-1.5 text-xs bg-gold/8 border border-gold/20 text-gold px-3 py-1.5 rounded-full font-medium"
                    >
                      <InclusionIcon label={inc} />
                      {inc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* PRODUCT SUMMARY grid */}
            {summaryFields.length > 0 && (
              <div className="border border-taupe/15 rounded-xl p-4 bg-white">
                <p className="text-taupe text-[10px] font-bold uppercase tracking-widest mb-3">Product Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
                  {summaryFields.map(({ field, label, value }) => (
                    <div key={field} className="flex flex-col items-center text-center gap-1.5 px-2 py-2">
                      <div className="w-7 h-7 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 text-gold mt-0.5">
                        <SummaryIcon field={field} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-taupe text-[9px] font-semibold uppercase tracking-wider leading-none mb-1">{label}</p>
                        <p className="text-charcoal text-xs font-medium leading-snug break-words">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPTION with Read more toggle */}
            {descFull && (
              <div className="border border-taupe/15 rounded-xl p-4 bg-white">
                <p className="text-taupe text-[10px] font-bold uppercase tracking-widest mb-2">Description</p>
                <p className="text-charcoal text-sm leading-relaxed">{descText}</p>
                {descFull.length > descMaxLen && (
                  <button
                    onClick={() => setDescExpanded(v => !v)}
                    className="text-gold text-xs font-semibold mt-2 hover:underline focus:outline-none"
                  >
                    {descExpanded ? 'Read less ▲' : 'Read more ▼'}
                  </button>
                )}
              </div>
            )}

            {/* AUTHENTICATION PROCESS section */}
            <div className="border border-taupe/12 rounded-2xl p-6 bg-taupe/3">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <p className="text-charcoal font-bold text-sm uppercase tracking-widest mb-4">Authentication Process</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      'Authenticity verified with original brand standards',
                      'Condition reviewed and graded',
                      'Serial number / reference code checked',
                      'Photos matched with the actual item',
                      'Material, stitching & hardware inspected',
                      'We guarantee 100% authentic luxury items.',
                    ].map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald/15 border border-emerald/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IconCheck className="w-2.5 h-2.5 text-emerald" />
                        </span>
                        <p className="text-charcoal text-xs leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gold seal badge */}
                <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-1">
                  <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-md">
                    <div className="text-center">
                      <IconShield className="w-7 h-7 text-almost-black mx-auto" />
                    </div>
                  </div>
                  <p className="text-gold text-[9px] font-bold uppercase tracking-wider text-center leading-tight">
                    Verified<br />Authentic
                  </p>
                </div>
              </div>
            </div>

            {/* Extra meta: wear notes, provenance, auth note, certificate */}
            {(product.wearNotes || product.provenance || product.authenticationNote || product.certificateNumber) && (
              <div className="space-y-4">
                {product.authenticationNote && (
                  <div className="bg-emerald/8 border border-emerald/20 rounded-xl px-4 py-3">
                    <p className="text-emerald text-xs font-semibold uppercase tracking-wide mb-1">Authentication Note</p>
                    <p className="text-charcoal text-sm">{product.authenticationNote}</p>
                  </div>
                )}
                {product.certificateNumber && (
                  <div className="flex justify-between text-sm bg-taupe/5 border border-taupe/10 rounded-xl px-4 py-3">
                    <span className="text-taupe">Certificate No.</span>
                    <span className="text-charcoal font-mono">{product.certificateNumber}</span>
                  </div>
                )}
                {product.wearNotes && (
                  <div>
                    <p className="text-taupe text-[10px] font-bold uppercase tracking-widest mb-1">Wear Notes</p>
                    <p className="text-charcoal text-sm">{product.wearNotes}</p>
                  </div>
                )}
                {product.provenance && (
                  <div>
                    <p className="text-taupe text-[10px] font-bold uppercase tracking-widest mb-1">Provenance</p>
                    <p className="text-charcoal text-sm leading-relaxed">{product.provenance}</p>
                  </div>
                )}
              </div>
            )}

            {/* BUY FLOW INFOGRAPHIC */}
            {hasAuction && !product.sold && (isActive || isPending) && (
              <BuyFlowInfographic product={product} auction={auction} />
            )}
          </div>

          {/* ── RIGHT COLUMN (sticky) ── */}
          <div id="auction-panel" className="lg:sticky lg:top-20 self-start space-y-3 animate-fade-up-delay-1 pb-6">

            {/* Auction panel */}
            {hasAuction && !product.sold && isActive && (
              <LiveAuctionPanel auction={auction} bids={bids} product={product} />
            )}
            {hasAuction && !product.sold && isPending && (
              <PendingAuctionPanel auction={auction} product={product} />
            )}

            {/* Buy Now Completed */}
            {hasAuction && isSold && (auction.bidCount === 0) && (
              <BuyNowCompletedPanel auction={auction} product={product} />
            )}

            {/* Auction Completed (win or closed) */}
            {hasAuction && ((isSold && auction.bidCount > 0) || isClosed) && (
              <AuctionCompletedPanel auction={auction} bids={bids} product={product} />
            )}

            {/* Buy Now only */}
            {!hasAuction && product.buyNowPrice && !product.sold && (
              <BuyNowOnlyPanel product={product} />
            )}

            {/* Product sold (no auction) */}
            {product.sold && !hasAuction && (
              <div className="bg-taupe/5 border border-taupe/15 rounded-xl px-5 py-4">
                <span className="text-burgundy text-sm font-semibold">This item has been sold.</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
