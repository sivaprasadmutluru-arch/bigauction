import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { buyNow, fetchWallet } from '../features/wallet/walletSlice'
import { checkoutAuctionWin, purchaseTicketByCard } from '../features/auctions/auctionsSlice'
import { fetchAddresses, addAddress } from '../features/addresses/addressSlice'

const GCC_COUNTRIES = ['UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman', 'Qatar']

const EMPTY_ADDRESS = {
  shippingName: '',
  shippingPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingCountry: 'UAE',
}

const toCheckoutAddress = saved => ({
  shippingName: saved?.fullName || '',
  shippingPhone: saved?.phone || '',
  shippingAddress: [saved?.addressLine1, saved?.addressLine2].filter(Boolean).join(', '),
  shippingCity: saved?.city || '',
  shippingCountry: saved?.country || 'UAE',
})

const toAddressBookPayload = address => ({
  label: 'Checkout Address',
  fullName: address.shippingName,
  phone: address.shippingPhone,
  addressLine1: address.shippingAddress,
  city: address.shippingCity,
  country: address.shippingCountry,
  isDefault: false,
})

const GRADE_LABEL = {
  LIKE_NEW:   'Like New',
  EXCELLENT:  'Excellent',
  VERY_GOOD:  'Very Good',
  GOOD:       'Good',
  FAIR:       'Fair',
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatCompletedAt(date) {
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' (GST)'
}

function auctionDuration(startStr, endStr) {
  if (!startStr || !endStr) return '—'
  const ms = new Date(endStr) - new Date(startStr)
  if (ms <= 0) return '—'
  const days = Math.round(ms / 86400000)
  if (days >= 1) return `${days} Day${days !== 1 ? 's' : ''}`
  const hrs = Math.round(ms / 3600000)
  return `${hrs} Hour${hrs !== 1 ? 's' : ''}`
}

// ── Icons ─────────────────────────────────────────────────────────────
function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}
function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
function IconWallet({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  )
}
function IconStar({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}
function IconTruck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  )
}
function IconInfo({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  )
}
function IconCalendar({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}
function IconGift({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}
function IconUser({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}
function IconSupport({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  )
}

// ── Product Detail Left Column (shared by BuyNowSuccessScreen) ────────
function InclusionIcon({ type }) {
  const icons = {
    box: <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    bag: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />,
    card: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
    receipt: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />,
    booklet: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
    strap: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />,
    warranty: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
  }
  const d = icons[type] || icons.card
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{d}</svg>
  )
}

function SummaryIcon({ type }) {
  const paths = {
    brand: <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />,
    model: <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    material: <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />,
    year: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />,
    serial: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />,
    origin: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>,
    condition: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
  }
  return (
    <svg className="w-5 h-5 text-taupe/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {paths[type]}
    </svg>
  )
}

function ProductLeftColumn({ product }) {
  const [activeImg, setActiveImg] = useState(0)
  const [readMore, setReadMore] = useState(false)

  const images = (product.imageUrls || [])
  const image = images[activeImg] || images[0]

  const inclusions = [
    product.includesBox             && { label: 'Original Box',      icon: 'box' },
    product.includesDustBag         && { label: 'Dust Bag',          icon: 'bag' },
    product.includesAuthCard        && { label: 'Auth Card',         icon: 'card' },
    product.includesOriginalReceipt && { label: 'Original Receipt',  icon: 'receipt' },
    product.includesCareBooklet     && { label: 'Care Booklet',      icon: 'booklet' },
    product.includesWarrantyCard    && { label: 'Warranty Card',     icon: 'warranty' },
    product.includesExtraStrap      && { label: 'Extra Strap',       icon: 'strap' },
  ].filter(Boolean)

  const summary = [
    { key: 'brand',     label: 'Brand',      value: product.brand },
    { key: 'model',     label: 'Model',      value: product.modelName },
    { key: 'material',  label: 'Material',   value: product.material },
    { key: 'year',      label: 'Year',       value: product.yearOfManufacture },
    { key: 'serial',    label: 'Serial / Ref', value: product.serialNumber },
    { key: 'origin',    label: 'Origin',     value: product.sourceCountry },
    { key: 'condition', label: 'Condition',  value: GRADE_LABEL[product.conditionGrade] || product.conditionGrade },
  ].filter(s => s.value)

  const desc = product.description || ''
  const showReadMore = desc.length > 200

  return (
    <div className="space-y-6">
      {/* Brand + Title */}
      <div>
        <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] mb-1">{product.brand}</p>
        <h1 className="font-display text-charcoal text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
        {product.modelName && (
          <p className="text-taupe text-sm mt-1 font-mono">{product.modelName}</p>
        )}
      </div>

      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden bg-taupe/5 border border-taupe/10">
        {image ? (
          <img src={image} alt={product.name} className="w-full aspect-[4/3] object-cover" />
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center">
            <span className="text-taupe/20 text-6xl font-display">◆</span>
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg(i => Math.max(0, i - 1))}
              disabled={activeImg === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-charcoal disabled:opacity-30 hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
              disabled={activeImg === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-charcoal disabled:opacity-30 hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeImg ? 'border-gold shadow-md' : 'border-taupe/15 opacity-60 hover:opacity-100'
              }`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Inclusions */}
      {inclusions.length > 0 && (
        <div>
          <p className="text-charcoal text-xs font-bold uppercase tracking-widest mb-3">Inclusions</p>
          <div className="flex flex-wrap gap-2">
            {inclusions.map(inc => (
              <span key={inc.label} className="inline-flex items-center gap-1.5 text-xs border border-taupe/20 text-taupe bg-taupe/5 px-3 py-1.5 rounded-full">
                <InclusionIcon type={inc.icon} />
                {inc.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Product Summary */}
      {summary.length > 0 && (
        <div>
          <p className="text-emerald text-xs font-bold uppercase tracking-widest mb-4">Product Summary</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
            {summary.map(s => (
              <div key={s.key} className="flex flex-col items-center text-center gap-1.5">
                <SummaryIcon type={s.key} />
                <span className="text-taupe text-[10px] uppercase tracking-wide leading-tight">{s.label}</span>
                <span className="text-charcoal text-xs font-semibold leading-tight">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {desc && (
        <div>
          <p className="text-emerald text-xs font-bold uppercase tracking-widest mb-2">Description</p>
          <div className="text-charcoal text-sm leading-relaxed">
            {showReadMore && !readMore ? (
              <>
                <span>{desc.slice(0, 200)}…</span>
                <button onClick={() => setReadMore(true)} className="text-emerald font-semibold ml-1 hover:underline">
                  Read more ↓
                </button>
              </>
            ) : (
              <>
                <span>{desc}</span>
                {showReadMore && (
                  <button onClick={() => setReadMore(false)} className="text-emerald font-semibold ml-1 hover:underline">
                    Read less ↑
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Authentication Process */}
      <div>
        <p className="text-emerald text-xs font-bold uppercase tracking-widest mb-2">Authentication Process</p>
        <p className="text-taupe text-sm mb-3">Each item is carefully verified by our in-house experts before listing.</p>
        <div className="space-y-2">
          {[
            'Authenticity verified with original brand standards',
            'Serial number / reference code checked',
            'Material, stitching & hardware inspected',
            'Condition reviewed and graded',
            'Photos matched with the actual item',
            'We guarantee 100% authentic luxury items.',
          ].map(point => (
            <div key={point} className="flex items-start gap-2">
              <IconCheck className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
              <span className="text-charcoal text-sm">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Buy Now Success Screen ─────────────────────────────────────────────
function BuyNowSuccessScreen({ product, auction, user, completedAt }) {
  const navigate = useNavigate()
  const buyNowPrice = product.buyNowPrice ? Number(product.buyNowPrice) : 0
  const ticketPrice = auction?.ticketPrice ? Number(auction.ticketPrice) : 0
  const rewardCredits = 10 // bonus reward credits

  const buyerName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.email?.split('@')[0] || 'You'
    : 'You'

  const ticketsSold = auction?.ticketsSold || 0
  const ticketTarget = auction?.ticketTarget || 0
  const duration = auctionDuration(auction?.scheduledStartTime, auction?.scheduledEndTime)
  const maxBid = auction?.maxBidAmount ? Number(auction.maxBidAmount) : null

  return (
    <div className="min-h-screen bg-ivory">
      {/* Breadcrumb */}
      <div className="border-b border-taupe/10 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-taupe">
          <a href="/" className="hover:text-gold transition-colors">Home</a>
          <span className="text-taupe/30">›</span>
          <a href="/auctions" className="hover:text-gold transition-colors">Auctions</a>
          <span className="text-taupe/30">›</span>
          <span className="text-charcoal font-medium truncate max-w-[200px]">{product.name?.toUpperCase()}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10">

          {/* Left: product details */}
          <ProductLeftColumn product={product} />

          {/* Right: confirmation panel */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">

            {/* Header */}
            <div className="bg-emerald rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-gold/60 flex items-center justify-center flex-shrink-0">
                <IconBag className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-gold text-xs font-bold uppercase tracking-widest">Instant Buy Completed</p>
                <p className="text-ivory/80 text-sm mt-0.5">This item was secured before the live auction started.</p>
              </div>
            </div>

            {/* Buyer + amount */}
            <div className="bg-white border border-taupe/15 rounded-2xl p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-taupe/10 rounded-full flex items-center justify-center mx-auto">
                <IconUser className="w-7 h-7 text-taupe" />
              </div>
              <div>
                <p className="text-taupe text-xs font-semibold uppercase tracking-widest">Buyer</p>
                <p className="text-emerald text-xl font-bold font-display mt-1">{buyerName}</p>
              </div>
              <div className="pt-2 border-t border-taupe/10">
                <p className="text-taupe text-sm">Instant Buy Amount</p>
                <p className="text-gold text-3xl font-bold font-display mt-1">AED {buyNowPrice.toLocaleString()}</p>
              </div>
              {completedAt && (
                <div className="flex items-center justify-center gap-2 text-taupe text-xs pt-1">
                  <IconCalendar className="w-3.5 h-3.5 flex-shrink-0" />
                  Completed on {formatCompletedAt(completedAt)}
                </div>
              )}
            </div>

            {/* Thank you card */}
            <div className="bg-white border border-taupe/15 rounded-2xl p-5 space-y-4">
              {/* Thank you note */}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-emerald/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconGift className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <p className="text-emerald text-sm font-semibold">Thank you for your interest!</p>
                  <p className="text-taupe text-sm mt-0.5">This item was secured through Instant Buy before the live auction started.</p>
                </div>
              </div>

              {ticketPrice > 0 && (
                <div className="border-t border-taupe/10 pt-4 flex items-start gap-3">
                  <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconWallet className="w-4.5 h-4.5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-charcoal text-sm">
                      <span className="font-semibold">Full ticket price</span> has been returned to your <span className="font-semibold">Wallet Balance.</span>
                    </p>
                  </div>
                  <span className="text-charcoal font-bold text-sm flex-shrink-0">AED {ticketPrice.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-taupe/10 pt-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconStar className="w-4.5 h-4.5 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-charcoal text-sm">
                    As a thank you for joining early, <span className="text-emerald font-semibold">extra Reward Credits</span> have been added for your future <span className="text-emerald font-semibold">auction tickets.</span>
                  </p>
                </div>
                <span className="text-charcoal font-bold text-sm flex-shrink-0">AED {rewardCredits}</span>
              </div>

              {ticketPrice > 0 && (
                <div className="border-t border-taupe/10 pt-4 flex items-start gap-3 bg-gold/5 rounded-xl px-3 py-3">
                  <IconInfo className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-taupe text-xs flex-1">
                    If you prefer to withdraw the refunded ticket amount, you can submit a refund request from My Requests.
                  </p>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-charcoal text-xs font-semibold border border-taupe/25 px-3 py-1.5 rounded-lg hover:border-gold/40 hover:text-gold transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    Go to My Requests →
                  </button>
                </div>
              )}
            </div>

            {/* Auction Summary */}
            {auction && (
              <div className="bg-white border border-taupe/15 rounded-2xl p-5 space-y-3">
                <p className="text-emerald text-xs font-bold uppercase tracking-widest">Auction Summary</p>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Completion Type',     value: 'Instant Buy' },
                    ticketPrice > 0 && { label: 'Ticket Price',          value: `AED ${ticketPrice.toLocaleString()}` },
                    ticketTarget > 0 && { label: 'Tickets Sold',          value: `${ticketsSold} / ${ticketTarget}` },
                    duration !== '—' && { label: 'Auction Duration',      value: duration },
                    maxBid && { label: 'Maximum Bid Amount',   value: `AED ${maxBid.toLocaleString()}` },
                  ].filter(Boolean).map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-taupe">{row.label}</span>
                      <span className="text-charcoal font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="bg-white border border-taupe/15 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconTruck className="w-4.5 h-4.5 text-emerald" />
                </div>
                <p className="text-emerald text-xs font-bold uppercase tracking-widest">What Happens Next?</p>
              </div>
              <p className="text-taupe text-sm">
                The item will be prepared and delivered with full authentication and secure packaging.
              </p>
              <button
                onClick={() => navigate('/help')}
                className="border border-taupe/20 text-charcoal text-sm px-4 py-2 rounded-lg hover:border-gold/40 hover:text-gold transition-colors"
              >
                Learn More About Delivery
              </button>
            </div>

            {/* Back to auctions */}
            <button
              onClick={() => navigate('/auctions')}
              className="w-full border border-taupe/20 text-charcoal text-sm py-3 rounded-xl hover:border-gold/40 hover:text-gold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to All Auctions
            </button>
          </div>
        </div>
      </div>

      {/* Footer trust bar */}
      <div className="border-t border-taupe/10 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: <IconShield className="w-6 h-6 text-emerald" />, title: 'Secure Payments',      sub: '100% Protected' },
              { icon: <IconCheck className="w-6 h-6 text-emerald" />,  title: 'Verified Luxury Items', sub: 'Authentic & Inspected' },
              { icon: <IconTruck className="w-6 h-6 text-emerald" />,  title: 'UAE Wide Delivery',    sub: 'Safe & Fast Delivery' },
              { icon: <IconSupport className="w-6 h-6 text-emerald" />, title: '24/7 Customer Support', sub: "We're Here to Help" },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-emerald/20 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-charcoal text-sm font-semibold">{item.title}</p>
                  <p className="text-taupe text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Form helpers ───────────────────────────────────────────────────────
function InputField({ label, name, value, onChange, type = 'text', required, placeholder, inputMode, maxLength, pattern, helpText }) {
  return (
    <div>
      <label className="block text-taupe text-xs font-medium mb-1.5">
        {label}{required && <span className="text-gold ml-0.5">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        inputMode={inputMode} maxLength={maxLength} pattern={pattern}
        className="w-full bg-white border border-taupe/25 text-charcoal placeholder-taupe/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
      />
      {helpText && <p className="text-taupe/70 text-[11px] mt-1.5">{helpText}</p>}
    </div>
  )
}

function StepIndicator({ step, current }) {
  const done = current > step
  const active = current === step
  return (
    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
      done    ? 'bg-emerald text-ivory' :
      active  ? 'bg-gold text-almost-black' :
                'bg-taupe/20 text-taupe'
    }`}>
      {done ? '✓' : step}
    </div>
  )
}

function SuccessScreen({ title = 'Order Confirmed!', subtitle = 'Your order has been placed successfully.', note, redirectLabel = 'Redirecting to your orders…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-emerald/20 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-emerald/15 border-2 border-emerald/40 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-charcoal text-3xl font-bold mb-3">{title}</h2>
        <p className="text-taupe text-base mb-2">{subtitle}</p>
        {note && <p className="text-taupe/70 text-sm mb-8">{note}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="bg-white border border-taupe/15 rounded-lg px-5 py-3 text-sm text-taupe">
            {redirectLabel}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ticket Success Screen ─────────────────────────────────────────────
function TicketSuccessScreen({ productId, navigate }) {
  useEffect(() => {
    const timer = setTimeout(() => navigate(`/products/${productId}`), 2500)
    return () => clearTimeout(timer)
  }, [productId, navigate])

  return (
    <SuccessScreen
      title="Ticket Purchased!"
      subtitle="Your auction entry ticket has been confirmed."
      note="You can place offers once the auction goes live."
      redirectLabel="Returning to auction…"
    />
  )
}

// ── Ticket Card Payment Checkout ───────────────────────────────────────
function TicketCheckout({ product, auction, onSuccess }) {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.auctions)
  const ticketPrice = Number(auction.ticketPrice)

  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError] = useState(null)

  const onChange = e => setCard(c => ({ ...c, [e.target.name]: e.target.value }))

  const onNumberChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim()
    setCard(c => ({ ...c, number: formatted }))
  }

  const onExpiryChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    const formatted = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
    setCard(c => ({ ...c, expiry: formatted }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      await dispatch(purchaseTicketByCard(auction.id)).unwrap()
      onSuccess()
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Payment failed. Please try again.')
    }
  }

  const image = product.imageUrls?.[0]
  const ticketsRemaining = (auction.ticketTarget || 0) - (auction.ticketsSold || 0)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">

        {/* Left: card form */}
        <form onSubmit={onSubmit} className="space-y-6 order-2 lg:order-1">
          <div>
            <h1 className="text-charcoal text-3xl font-bold">Card Payment</h1>
            <p className="text-taupe text-sm mt-1">Enter your card details to purchase your auction ticket.</p>
          </div>

          <div className="bg-white border border-taupe/15 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-taupe text-xs font-medium mb-1.5">Name on Card<span className="text-gold ml-0.5">*</span></label>
              <input
                name="name" value={card.name} onChange={onChange} required
                placeholder="As it appears on your card"
                className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-taupe text-xs font-medium mb-1.5">Card Number<span className="text-gold ml-0.5">*</span></label>
              <input
                name="number" value={card.number} onChange={onNumberChange} required
                placeholder="0000 0000 0000 0000" maxLength={19}
                className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-taupe text-xs font-medium mb-1.5">Expiry Date<span className="text-gold ml-0.5">*</span></label>
                <input
                  name="expiry" value={card.expiry} onChange={onExpiryChange} required
                  placeholder="MM/YY" maxLength={5}
                  className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-taupe text-xs font-medium mb-1.5">CVV<span className="text-gold ml-0.5">*</span></label>
                <input
                  name="cvv" value={card.cvv}
                  onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  required placeholder="•••" maxLength={4}
                  className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-xl px-4 py-3">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-gold text-almost-black font-bold py-4 rounded-xl text-base hover:bg-gold/90 disabled:opacity-50 transition-colors shadow-lg shadow-gold/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-almost-black/30 border-t-almost-black rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              `Pay AED ${ticketPrice.toLocaleString()}`
            )}
          </button>

          <p className="text-taupe text-xs text-center">Your card details are processed securely. Ticket is non-refundable.</p>
        </form>

        {/* Right: ticket summary card */}
        <div className="order-1 lg:order-2">
          <div className="bg-white border border-taupe/15 rounded-2xl overflow-hidden lg:sticky lg:top-6">
            {image && (
              <div className="aspect-[4/3] bg-taupe/10 overflow-hidden">
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-gold text-xs font-semibold uppercase tracking-widest">{product.brand}</p>
                <h3 className="text-charcoal font-bold text-lg mt-1 leading-snug font-display">{product.name}</h3>
              </div>
              <div className="border-t border-taupe/10 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-taupe">Auction Entry Ticket</span>
                  <span className="text-charcoal font-medium">AED {ticketPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-taupe">Tickets remaining</span>
                  <span className="text-charcoal">{ticketsRemaining.toLocaleString()}</span>
                </div>
                <div className="border-t border-taupe/10 pt-2.5 flex justify-between font-bold">
                  <span className="text-charcoal text-base">Total</span>
                  <span className="text-gold text-xl">AED {ticketPrice.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-taupe/10 pt-4 space-y-2.5">
                {['Secure card payment', 'Instant ticket confirmation', 'Join the live auction and place offers'].map(note => (
                  <div key={note} className="flex items-center gap-2 text-xs text-taupe">
                    <span className="text-gold flex-shrink-0">◆</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Main Checkout Page ─────────────────────────────────────────────────
export default function CheckoutPage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const dispatch  = useDispatch()

  const { wallet, loading: walletLoading } = useSelector(s => s.wallet)
  const { loading: auctionLoading }         = useSelector(s => s.auctions)
  const { items: savedAddresses }           = useSelector(s => s.addresses)
  const { user }                            = useSelector(s => s.auth)
  const submitting = walletLoading || auctionLoading

  const state = location.state || {}
  const { type, product, auction } = state

  const [step, setStep]             = useState(1)
  const [address, setAddress]       = useState(EMPTY_ADDRESS)
  const [selectedAddressId, setSelectedAddressId] = useState('new')
  const [addressInitialized, setAddressInitialized] = useState(false)
  const [creditInput, setCreditInput] = useState(null)
  const [auctionPaymentMethod, setAuctionPaymentMethod] = useState('card')
  const [card, setCard]             = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(false)
  const [completedAt, setCompletedAt] = useState(null)

  useEffect(() => {
    dispatch(fetchWallet())
    if (user) dispatch(fetchAddresses())
  }, [dispatch, user])

  useEffect(() => {
    if (addressInitialized || savedAddresses.length === 0) return
    const preferred = savedAddresses.find(a => a.isDefault) || savedAddresses[0]
    setAddress(toCheckoutAddress(preferred))
    setSelectedAddressId(String(preferred.id))
    setAddressInitialized(true)
  }, [addressInitialized, savedAddresses])

  if (!type || !product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl text-taupe/20 mb-6">◆</div>
        <h2 className="text-charcoal text-xl font-semibold mb-3">Nothing to check out</h2>
        <p className="text-taupe text-sm mb-6">Please return to the product page and try again.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-gold text-almost-black font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gold/90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  // ── Ticket card payment ──
  if (type === 'ticket') {
    if (success) return <TicketSuccessScreen productId={product.id} navigate={navigate} />
    return (
      <div className="min-h-screen bg-ivory">
        <div className="border-b border-taupe/10 bg-white/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="text-taupe text-sm hover:text-charcoal flex items-center gap-1.5 transition-colors"
            >
              ‹ Back
            </button>
          </div>
        </div>
        <TicketCheckout
          product={product}
          auction={auction}
          onSuccess={() => setSuccess(true)}
        />
      </div>
    )
  }

  // ── Buy Now success → full confirmation screen ──
  if (success && type === 'buynow') {
    return <BuyNowSuccessScreen product={product} auction={auction} user={user} completedAt={completedAt} />
  }

  // ── Auction win success ──
  if (success) {
    return (
      <SuccessScreen
        title="Order Confirmed!"
        subtitle="Your winning bid checkout was successful."
        note="You'll receive a confirmation shortly."
        redirectLabel="Redirecting to your orders…"
      />
    )
  }

  const walletBal = wallet ? Number(wallet.balance) : 0
  const basePrice = type === 'buynow'
    ? Number(product.buyNowPrice)
    : Number(auction?.currentHighestBid || 0)
  const credit    = type === 'buynow' && creditInput === null
    ? Math.min(walletBal, basePrice)
    : type === 'buynow'
    ? Math.min(Math.max(Number(creditInput) || 0, 0), walletBal, basePrice)
    : 0
  const auctionWalletPayment = type === 'auction' && auctionPaymentMethod === 'wallet'
  const totalDue  = type === 'auction'
    ? (auctionWalletPayment ? 0 : basePrice)
    : Math.max(basePrice - credit, 0)

  const onAddressChange = e => {
    const value = e.target.name === 'shippingPhone'
      ? e.target.value.replace(/\D/g, '').slice(0, 10)
      : e.target.value
    setAddress(a => ({ ...a, [e.target.name]: value }))
    setSelectedAddressId('new')
  }

  const onSavedAddressChange = e => {
    const id = e.target.value
    setSelectedAddressId(id)
    const saved = savedAddresses.find(a => String(a.id) === id)
    setAddress(saved ? toCheckoutAddress(saved) : EMPTY_ADDRESS)
  }

  const onCardChange = e => setCard(c => ({ ...c, [e.target.name]: e.target.value }))

  const onCardNumberChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim()
    setCard(c => ({ ...c, number: formatted }))
  }

  const onCardExpiryChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    const formatted = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
    setCard(c => ({ ...c, expiry: formatted }))
  }

  const phoneValid = /^\d{10}$/.test(address.shippingPhone)

  const addressComplete =
    address.shippingName.trim() &&
    phoneValid &&
    address.shippingAddress.trim() &&
    address.shippingCity.trim()

  const onContinue = e => {
    e.preventDefault()
    if (!addressComplete) {
      setError(address.shippingPhone && !phoneValid
        ? 'Phone number must contain exactly 10 digits.'
        : 'Please fill in all required address fields.')
      return
    }
    setError(null)
    setStep(2)
  }

  const onSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      if (selectedAddressId === 'new') {
        await dispatch(addAddress(toAddressBookPayload(address))).unwrap()
      }
      if (type === 'buynow') {
        await dispatch(buyNow({
          productId: product.id,
          creditToApply: credit,
          paymentMethod: totalDue > 0 ? 'CARD' : 'WALLET',
          cardAmount: totalDue,
          address,
        })).unwrap()
      } else {
        if (auctionWalletPayment && walletBal < basePrice) {
          setError('Insufficient wallet balance. Please pay by card or top up your wallet.')
          return
        }
        await dispatch(checkoutAuctionWin({
          auctionId: auction.id,
          creditToApply: 0,
          paymentMethod: auctionWalletPayment ? 'WALLET' : 'CARD',
          cardAmount: auctionWalletPayment ? 0 : basePrice,
          address,
        })).unwrap()
      }
      setCompletedAt(new Date())
      setSuccess(true)
      if (type !== 'buynow') {
        setTimeout(() => navigate('/orders'), 3000)
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Checkout failed. Please try again.')
    }
  }

  const image = product.imageUrls?.[0]

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top bar */}
      <div className="border-b border-taupe/10 bg-white/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : navigate(-1)}
            className="text-taupe text-sm hover:text-charcoal flex items-center gap-1.5 transition-colors"
          >
            ‹ {step === 2 ? 'Back to address' : 'Back'}
          </button>

          <div className="flex items-center gap-3">
            <StepIndicator step={1} current={step} />
            <div className={`h-px w-10 transition-colors ${step >= 2 ? 'bg-gold' : 'bg-taupe/20'}`} />
            <StepIndicator step={2} current={step} />
            <div className="h-px w-10 bg-taupe/20" />
            <StepIndicator step={3} current={step} />
          </div>

          <p className="text-taupe text-xs">
            {step === 1 ? 'Delivery' : step === 2 ? 'Review & Confirm' : 'Done'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">

          {/* Left column */}
          <div className="lg:col-span-3 order-2 lg:order-1">

            {/* Step 1: Address */}
            {step === 1 && (
              <form onSubmit={onContinue} className="space-y-6">
                <div>
                  <h1 className="text-charcoal text-2xl font-bold">Delivery Address</h1>
                  <p className="text-taupe text-sm mt-1">Use a saved address or add a new one for this order.</p>
                </div>

                <div className="bg-white border border-taupe/15 rounded-xl p-6 space-y-4">
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block text-taupe text-xs font-medium mb-1.5">Saved Address</label>
                      <select
                        value={selectedAddressId}
                        onChange={onSavedAddressChange}
                        className="w-full bg-white border border-taupe/25 text-charcoal rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                      >
                        {savedAddresses.map(saved => (
                          <option key={saved.id} value={saved.id}>{saved.label} - {saved.city}, {saved.country}</option>
                        ))}
                        <option value="new">Add a new address</option>
                      </select>
                    </div>
                  )}
                  <InputField label="Full Name" name="shippingName" value={address.shippingName} onChange={onAddressChange} required placeholder="As it appears on your ID" />
                  <InputField
                    label="Phone Number"
                    name="shippingPhone"
                    value={address.shippingPhone}
                    onChange={onAddressChange}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                    placeholder="0501234567"
                    helpText={`${address.shippingPhone.length}/10 digits`}
                  />
                  <div>
                    <label className="block text-taupe text-xs font-medium mb-1.5">Country<span className="text-gold ml-0.5">*</span></label>
                    <select
                      name="shippingCountry" value={address.shippingCountry} onChange={onAddressChange}
                      className="w-full bg-white border border-taupe/25 text-charcoal rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                    >
                      {GCC_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <InputField label="Street / Building / Apartment" name="shippingAddress" value={address.shippingAddress} onChange={onAddressChange} required placeholder="e.g. Villa 12, Al Wasl Road" />
                  <InputField label="City" name="shippingCity" value={address.shippingCity} onChange={onAddressChange} required placeholder="e.g. Dubai" />
                </div>

                {error && (
                  <div className="flex items-start gap-3 bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-lg px-4 py-3">
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="w-full bg-gold text-almost-black font-bold py-4 rounded-xl text-base hover:bg-gold/90 transition-colors shadow-lg shadow-gold/10">
                  Continue to Review →
                </button>
              </form>
            )}

            {/* Step 2: Review and confirm */}
            {step === 2 && (
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <h1 className="text-charcoal text-2xl font-bold">Review & Confirm Purchase</h1>
                  <p className="text-taupe text-sm mt-1">Confirm your delivery details and complete your order.</p>
                </div>

                <div className="bg-white border border-taupe/15 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-charcoal font-semibold text-sm">{address.shippingName}</p>
                      <p className="text-taupe text-sm mt-0.5">{address.shippingPhone}</p>
                      <p className="text-taupe text-sm">{address.shippingAddress}</p>
                      <p className="text-taupe text-sm">{address.shippingCity}, {address.shippingCountry}</p>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="text-gold text-xs hover:underline flex-shrink-0 ml-4">Edit</button>
                  </div>
                </div>

                {type === 'buynow' && walletBal > 0 && (
                  <div className="bg-white border border-taupe/15 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-charcoal font-semibold">Wallet Credit</h3>
                      <div className="bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
                        <span className="text-gold text-xs font-semibold">AED {walletBal.toLocaleString()} available</span>
                      </div>
                    </div>
                    <p className="text-taupe text-sm">Apply your wallet balance to reduce the amount due.</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-taupe text-xs mb-1.5">Amount to apply (AED)</label>
                        <input
                          type="number" value={credit} onChange={e => setCreditInput(e.target.value)}
                          min="0" max={Math.min(walletBal, basePrice)} step="0.01"
                          className="w-full bg-white border border-taupe/25 text-charcoal rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreditInput(null)}
                        className="mt-5 text-xs text-gold border border-gold/30 px-3 py-2.5 rounded-lg hover:bg-gold/10 transition-colors"
                      >
                        Use Max
                      </button>
                    </div>
                    {credit > 0 && (
                      <div className="flex items-center gap-2 text-emerald text-sm">
                        <span>✓</span>
                        <span>AED {credit.toLocaleString()} wallet credit will be applied</span>
                      </div>
                    )}
                  </div>
                )}

                {type === 'auction' && (
                  <div className="bg-white border border-taupe/15 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-charcoal font-semibold">Payment Method</h3>
                      <span className="text-gold text-xs font-semibold">Winning bid: AED {basePrice.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => walletBal >= basePrice && setAuctionPaymentMethod('wallet')}
                        disabled={walletBal < basePrice}
                        className={`text-left rounded-xl border p-4 transition-colors ${
                          auctionPaymentMethod === 'wallet'
                            ? 'border-emerald bg-emerald/5'
                            : 'border-taupe/20 hover:border-gold/40'
                        } ${walletBal < basePrice ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <p className="text-charcoal text-sm font-semibold">Wallet Balance</p>
                        <p className="text-taupe text-xs mt-1">Available: AED {walletBal.toLocaleString()}</p>
                        {walletBal < basePrice && <p className="text-burgundy text-xs mt-2">Not enough balance</p>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuctionPaymentMethod('card')}
                        className={`text-left rounded-xl border p-4 transition-colors ${
                          auctionPaymentMethod === 'card'
                            ? 'border-emerald bg-emerald/5'
                            : 'border-taupe/20 hover:border-gold/40'
                        }`}
                      >
                        <p className="text-charcoal text-sm font-semibold">Credit / Debit Card</p>
                        <p className="text-taupe text-xs mt-1">Pay securely by Visa or Mastercard</p>
                      </button>
                    </div>
                    <p className="text-taupe text-xs">Reward Credits cannot be used for final winning item payments.</p>
                  </div>
                )}

                {totalDue > 0 && (
                  <div className="bg-white border-2 border-emerald rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border-2 border-emerald bg-emerald flex items-center justify-center flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-charcoal text-sm font-semibold">Credit / Debit Card</p>
                          <p className="text-charcoal text-sm font-bold">AED {totalDue.toLocaleString()}</p>
                        </div>
                        <p className="text-taupe text-xs mt-0.5">Pay the remaining balance securely by card</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="bg-[#1A1F71] text-white text-[9px] font-bold italic px-2 py-[3px] rounded">VISA</span>
                        <div className="flex -space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#EB001B]" />
                          <span className="w-5 h-5 rounded-full bg-[#F79E1B]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-taupe/10">
                      <div>
                        <label className="block text-taupe text-xs font-medium mb-1.5">Name on Card<span className="text-gold ml-0.5">*</span></label>
                        <input
                          name="name" value={card.name} onChange={onCardChange} required
                          placeholder="As it appears on your card"
                          className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-taupe text-xs font-medium mb-1.5">Card Number<span className="text-gold ml-0.5">*</span></label>
                        <input
                          name="number" value={card.number} onChange={onCardNumberChange} required
                          placeholder="0000 0000 0000 0000" maxLength={19}
                          className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-taupe text-xs font-medium mb-1.5">Expiry Date<span className="text-gold ml-0.5">*</span></label>
                          <input
                            name="expiry" value={card.expiry} onChange={onCardExpiryChange} required
                            placeholder="MM/YY" maxLength={5}
                            className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-taupe text-xs font-medium mb-1.5">CVV<span className="text-gold ml-0.5">*</span></label>
                          <input
                            name="cvv" value={card.cvv}
                            onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            required placeholder="•••" maxLength={4}
                            className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/30 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-taupe text-xs">Your card details are processed securely.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-taupe/15 rounded-xl p-5">
                  <h3 className="text-charcoal font-semibold mb-3">Payment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-taupe">{type === 'buynow' ? 'Buy Now Price' : 'Winning Bid'}</span>
                      <span className="text-charcoal font-medium">AED {basePrice.toLocaleString()}</span>
                    </div>
                    {type === 'buynow' && credit > 0 && (
                      <div className="flex justify-between text-emerald">
                        <span>Wallet Credit</span>
                        <span>− AED {credit.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-taupe/15 pt-3 flex justify-between font-bold">
                      <span className="text-charcoal text-base">{type === 'auction' ? 'Amount to Pay' : 'Total Due'}</span>
                      <span className="text-gold text-xl">AED {(type === 'auction' ? basePrice : totalDue).toLocaleString()}</span>
                    </div>
                  </div>
                  {type === 'buynow' && totalDue > 0 && (
                    <p className="text-emerald text-xs mt-4 bg-emerald/5 border border-emerald/20 rounded-lg px-4 py-3">
                      AED {credit.toLocaleString()} from wallet + AED {totalDue.toLocaleString()} by card.
                    </p>
                  )}
                  {type === 'auction' && auctionWalletPayment && (
                    <p className="text-emerald text-xs mt-4 bg-emerald/5 border border-emerald/20 rounded-lg px-4 py-3">
                      AED {basePrice.toLocaleString()} will be debited from your wallet after confirmation.
                    </p>
                  )}
                  {type === 'buynow' && totalDue === 0 && (
                    <p className="text-emerald text-xs mt-4 bg-emerald/5 border border-emerald/20 rounded-lg px-4 py-3">
                      ✓ Fully covered by your wallet credit. No additional payment required.
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-3 bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-lg px-4 py-3">
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-gold text-almost-black font-bold py-4 rounded-xl text-base hover:bg-gold/90 disabled:opacity-50 transition-colors shadow-lg shadow-gold/10"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-almost-black/30 border-t-almost-black rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    type === 'auction' && auctionWalletPayment
                      ? `Pay by Wallet — AED ${basePrice.toLocaleString()}`
                      : totalDue > 0
                      ? `Pay by Card — AED ${totalDue.toLocaleString()}`
                      : 'Confirm Order — Wallet Payment'
                  )}
                </button>

                <p className="text-taupe text-xs text-center">
                  By placing this order you agree to our terms of service. All sales are final once confirmed.
                </p>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-taupe/15 rounded-xl overflow-hidden lg:sticky lg:top-6">
              {image && (
                <div className="aspect-[4/3] bg-taupe/10 overflow-hidden">
                  <img src={image} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-gold text-xs font-semibold uppercase tracking-widest">{product.brand}</p>
                  <h3 className="text-charcoal font-semibold mt-1 leading-snug">{product.name}</h3>
                  {product.conditionGrade && <p className="text-taupe text-xs mt-1">{GRADE_LABEL[product.conditionGrade] || product.conditionGrade}</p>}
                  {product.sourceCountry && <p className="text-taupe text-xs">From {product.sourceCountry}</p>}
                </div>
                <div className="border-t border-taupe/10 pt-4">
                  <div className="inline-flex items-center gap-2 bg-taupe/10 rounded-full px-3 py-1.5 text-xs">
                    <span className={`font-semibold ${type === 'buynow' ? 'text-gold' : 'text-emerald'}`}>
                      {type === 'buynow' ? 'Buy Now' : 'Auction Win'}
                    </span>
                    <span className="text-taupe/40">·</span>
                    <span className="text-charcoal font-bold">AED {basePrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-taupe/10 pt-4 space-y-2.5">
                  {['Authenticated luxury item', 'GCC delivery in 5–10 business days', 'Secure transaction'].map(note => (
                    <div key={note} className="flex items-center gap-2 text-xs text-taupe">
                      <span className="text-gold flex-shrink-0">◆</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
