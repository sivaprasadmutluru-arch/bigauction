import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFavourites, removeFavourite } from '../features/favourites/favouritesSlice'
import Loader from '../components/common/Loader'

const STATUS_BADGE = {
  PENDING: { label: 'Coming Soon', cls: 'bg-gold/20 text-gold border border-gold/30' },
  ACTIVE:  { label: 'Live',        cls: 'bg-emerald text-ivory' },
  CLOSED:  { label: 'Ended',       cls: 'bg-taupe/20 text-taupe border border-taupe/30' },
  SOLD:    { label: 'Sold',        cls: 'bg-burgundy/20 text-burgundy border border-burgundy/30' },
}

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ivory opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-ivory" />
    </span>
  )
}

function FavouriteCard({ item, onRemove }) {
  const isLive     = item.auctionStatus === 'ACTIVE'
  const isInactive = item.auctionStatus === 'CLOSED' || item.auctionStatus === 'SOLD'
  const badge      = STATUS_BADGE[item.auctionStatus]
  const image      = item.imageUrls?.[0]
  const currentBid = Number(item.currentHighestBid || 0)

  return (
    <div className={`group bg-white border rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${
      isInactive
        ? 'border-taupe/10 opacity-60 shadow-sm'
        : isLive
        ? 'border-gold/30 shadow-luxury hover:shadow-luxury-hover'
        : 'border-taupe/15 shadow-luxury hover:shadow-luxury-hover hover:border-gold/40'
    }`}>
      {/* Image */}
      <Link to={item.productId ? `/products/${item.productId}` : '#'} className="block">
        <div className="aspect-[3/2] bg-taupe/10 overflow-hidden relative">
          {image ? (
            <img src={image} alt={item.productName}
              className={`w-full h-full object-cover transition-all duration-500 ${isInactive ? 'grayscale' : 'group-hover:scale-105'}`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-taupe/20 text-5xl select-none">◆</div>
          )}

          {/* Status badge */}
          {item.auctionStatus && (isLive ? (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald px-2.5 py-1 rounded-full shadow-md">
              <LivePulse />
              <span className="text-xs font-semibold text-ivory">Live</span>
            </div>
          ) : (
            <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${badge?.cls}`}>
              {badge?.label}
            </span>
          ))}
        </div>
      </Link>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div>
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.15em]">{item.brand}</p>
          <Link to={item.productId ? `/products/${item.productId}` : '#'}>
            <h3 className="font-display text-charcoal font-semibold text-base mt-0.5 line-clamp-2 hover:text-gold transition-colors leading-snug" style={{ minHeight: '2.6rem' }}>
              {item.productName}
            </h3>
          </Link>
        </div>

        <div className="border-t border-taupe/10 pt-2 flex items-end justify-between">
          <div>
            <p className="text-taupe text-[11px] uppercase tracking-wide mb-0.5">
              {isLive ? 'Highest Offer Now' : item.auctionStatus === 'PENDING' ? 'Buy Now Price' : 'Final Amount'}
            </p>
            <p className={`font-semibold text-sm ${isLive ? 'text-gold font-bold' : 'text-charcoal'}`}>
              {isLive
                ? (currentBid > 0 ? `AED ${currentBid.toLocaleString()}` : 'No offers yet')
                : item.buyNowPrice
                ? `AED ${Number(item.buyNowPrice).toLocaleString()}`
                : currentBid > 0 ? `AED ${currentBid.toLocaleString()}` : '—'}
            </p>
          </div>

          <button onClick={() => onRemove(item.productId)} title="Remove from favourites"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-ivory transition-all">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FavouritesPage() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.favourites)
  const { user } = useSelector(s => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) dispatch(fetchFavourites())
    else navigate('/login')
  }, [user])

  const onRemove = productId => dispatch(removeFavourite(productId))

  if (loading && items.length === 0) return <Loader text="Loading…" />

  return (
    <div>
      {/* ── Emerald Hero ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#064C3B' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="font-display text-ivory text-3xl sm:text-4xl font-semibold">Saved Items</h1>
            {items.length > 0 && (
              <span className="bg-ivory/20 text-ivory text-xs font-semibold px-3 py-1 rounded-full">
                {items.length} saved
              </span>
            )}
          </div>
          <p className="text-ivory/70 text-base">Your favourite auctions and products in one place</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl text-taupe/20 mb-6">♡</div>
            <h3 className="font-display text-charcoal text-xl font-semibold mb-2">No saved items</h3>
            <p className="text-taupe text-sm mb-6">Tap the heart icon on any product to save it here.</p>
            <Link to="/auctions"
              className="inline-block btn-shimmer bg-gold-gradient text-almost-black font-bold px-7 py-3 rounded-xl text-sm shadow-md shadow-gold/20">
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <div key={item.productId} className="animate-card-enter" style={{ animationDelay: `${i * 0.05}s` }}>
                <FavouriteCard item={item} onRemove={onRemove} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
