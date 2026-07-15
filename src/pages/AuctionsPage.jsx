import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAuctions } from '../features/auctions/auctionsSlice'
import { fetchFavourites } from '../features/favourites/favouritesSlice'
import useFavourites from '../hooks/useFavourites'
import Loader from '../components/common/Loader'
import ProductCard from '../components/product/ProductCard'

const FILTERS = [
  { label: 'All',         value: 'ALL' },
  { label: 'Live Now',    value: 'ACTIVE' },
  { label: 'Coming Soon', value: 'PENDING' },
  { label: 'Ended',       value: 'CLOSED' },
  { label: 'Sold',        value: 'SOLD' },
]

const SORT_OPTIONS = [
  { label: 'Newest First',    value: 'newest' },
  { label: 'Ending Soon',     value: 'ending' },
  { label: 'Highest Offer',   value: 'highestBid' },
  { label: 'Lowest Ticket',   value: 'lowestTicket' },
]

function StatsBar({ auctions }) {
  const live    = auctions.filter(a => a.status === 'ACTIVE').length
  const pending = auctions.filter(a => a.status === 'PENDING').length
  const total   = auctions.length

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
      {live > 0 && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
          </span>
          <span className="text-emerald font-medium">{live} live</span>
        </div>
      )}
      {pending > 0 && <span className="text-gold">{pending} coming soon</span>}
      <span className="text-taupe">{total} total auctions</span>
    </div>
  )
}

export default function AuctionsPage() {
  const dispatch = useDispatch()
  const { items: auctions, loading } = useSelector(s => s.auctions)
  const { user } = useSelector(s => s.auth)
  const { isFavourite, toggle: toggleFavourite } = useFavourites()
  const [filter, setFilter] = useState('ALL')
  const [sort,   setSort]   = useState('newest')
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const PAGE_SIZE = 12

  useEffect(() => {
    dispatch(fetchAuctions())
    if (user) dispatch(fetchFavourites())
  }, [dispatch])
  useEffect(() => { setPage(1) }, [filter, sort, search])

  const processed = useMemo(() => {
    let list = filter === 'ALL' ? auctions : auctions.filter(a => a.status === filter)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(a =>
        a.product?.name?.toLowerCase().includes(q) ||
        a.product?.brand?.toLowerCase().includes(q)
      )
    }

    const sorted = [...list]
    switch (sort) {
      case 'ending':
        sorted.sort((a, b) => {
          if (!a.scheduledEndTime) return 1
          if (!b.scheduledEndTime) return -1
          return new Date(a.scheduledEndTime) - new Date(b.scheduledEndTime)
        })
        break
      case 'highestBid':
        sorted.sort((a, b) => Number(b.currentHighestBid || 0) - Number(a.currentHighestBid || 0))
        break
      case 'lowestTicket':
        sorted.sort((a, b) => Number(a.ticketPrice || 0) - Number(b.ticketPrice || 0))
        break
      default: // newest — rely on server order (already newest first)
        break
    }
    return sorted
  }, [auctions, filter, sort, search])

  const totalPages = Math.ceil(processed.length / PAGE_SIZE)
  const paginated  = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const liveCount  = auctions.filter(a => a.status === 'ACTIVE').length

  if (loading) return <Loader text="Loading auctions…" />

  return (
    <div className="min-h-screen bg-ivory">

      {/* Page Hero */}
      <div className="relative bg-emerald overflow-hidden">
        {/* dot-grid texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              {liveCount > 0 && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
                  </span>
                  {liveCount} LIVE NOW
                </span>
              )}
              <span className="text-white/50 text-xs font-medium uppercase tracking-widest">Auction House</span>
            </div>
            <h1 className="font-display text-white text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-3">
              All Auctions
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Browse our full catalogue of luxury auctions — live, coming soon, and recently closed.
            </p>
          </div>
          {/* stats strip */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: 'Total Auctions', value: auctions.length },
              { label: 'Live Now',       value: auctions.filter(a => a.status === 'ACTIVE').length },
              { label: 'Coming Soon',    value: auctions.filter(a => a.status === 'PENDING').length },
            ].map(s => (
              <div key={s.label}>
                <p className="text-white text-2xl font-bold font-display">{s.value}</p>
                <p className="text-white/60 text-xs uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Controls */}
        <div className="space-y-4 mb-8">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(f => {
              const count = f.value === 'ALL' ? auctions.length : auctions.filter(a => a.status === f.value).length
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    filter === f.value
                      ? 'bg-emerald text-white border-emerald shadow-sm'
                      : 'text-charcoal border-taupe/30 hover:border-emerald/50 hover:text-emerald bg-white'
                  }`}
                >
                  {f.value === 'ACTIVE' && count > 0 && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
                    </span>
                  )}
                  {f.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    filter === f.value ? 'bg-white/20' : 'bg-taupe/10 text-taupe'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe/50 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by brand or name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-taupe/20 text-charcoal placeholder-taupe/40 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-white border border-taupe/20 text-charcoal rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Stats line */}
          <StatsBar auctions={auctions} />
        </div>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl text-taupe/20 mb-6">◆</div>
            <h3 className="text-charcoal text-lg font-semibold mb-2">No auctions found</h3>
            <p className="text-taupe text-sm mb-6">
              {search ? `No results for "${search}"` : `No ${filter === 'ALL' ? '' : filter.toLowerCase() + ' '}auctions at this time.`}
            </p>
            {(filter !== 'ALL' || search) && (
              <button
                onClick={() => { setFilter('ALL'); setSearch('') }}
                className="text-gold text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.map((auction, i) => (
                <div key={auction.id} className="animate-card-enter h-full" style={{ animationDelay: `${(i % 8) * 0.05}s` }}>
                  <ProductCard
                    product={{ ...auction.product, auction }}
                    isFavourite={isFavourite(auction.product?.id)}
                    onToggleFavourite={() => toggleFavourite(auction.product?.id)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-lg text-sm text-taupe hover:text-charcoal border border-taupe/20 hover:border-taupe/50 disabled:opacity-30 transition-colors"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-emerald text-white font-bold shadow-sm'
                        : 'text-taupe hover:text-charcoal border border-taupe/20 hover:border-taupe/50 bg-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-lg text-sm text-taupe hover:text-charcoal border border-taupe/20 hover:border-taupe/50 disabled:opacity-30 transition-colors"
                >
                  ›
                </button>
              </div>
            )}

            <p className="text-center text-taupe text-xs mt-4">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, processed.length)} of {processed.length} auctions
            </p>
          </>
        )}
      </div>
    </div>
  )
}
