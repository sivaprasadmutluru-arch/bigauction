import { useEffect, useState } from 'react'
import api from '../services/api'
import Loader from '../components/common/Loader'

const STATUS_STYLE = {
  PENDING:   'bg-gold/10 text-gold',
  CONFIRMED: 'bg-emerald/10 text-emerald',
  DELIVERED: 'bg-emerald/20 text-emerald',
  CANCELLED: 'bg-burgundy/10 text-burgundy',
}

const TYPE_LABEL = {
  BUY_NOW:     'Buy Now',
  AUCTION_WIN: 'Auction Win',
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading orders…" />

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Emerald Hero ── */}
      <div className="relative bg-emerald overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20">
          <h1 className="font-display text-ivory text-2xl sm:text-3xl lg:text-4xl font-semibold">My Orders</h1>
          <p className="text-ivory/70 text-base mt-2">Your purchases and auction wins</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

      {orders.length === 0 ? (
        <div className="text-center py-16 text-taupe">
          <p className="text-4xl mb-4">◆</p>
          <p>No orders yet. Start exploring the marketplace!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-taupe/15 rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status] || 'bg-taupe/10 text-taupe'}`}>
                        {order.status}
                      </span>
                      <span className="text-taupe text-xs">{TYPE_LABEL[order.type] || order.type}</span>
                    </div>

                    <p className="text-charcoal font-semibold">{order.productName || `Order #${order.id}`}</p>
                    <p className="text-taupe text-xs mt-0.5">{order.productBrand}</p>

                    {order.creditApplied > 0 && (
                      <p className="text-taupe text-xs mt-1">
                        Credit applied: AED {Number(order.creditApplied).toLocaleString()}
                      </p>
                    )}

                    {order.status === 'CANCELLED' && (
                      <p className="text-burgundy text-xs mt-1">Refunded to your wallet</p>
                    )}

                    <p className="text-taupe text-xs mt-1">
                      {order.status === 'DELIVERED' && order.updatedAt
                        ? `Delivered ${new Date(order.updatedAt).toLocaleDateString()}`
                        : order.status === 'CANCELLED' && order.updatedAt
                        ? `Cancelled ${new Date(order.updatedAt).toLocaleDateString()}`
                        : `Ordered ${new Date(order.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-charcoal font-bold text-lg">
                      AED {Number(order.totalAmount).toLocaleString()}
                    </p>
                    {order.creditApplied > 0 && (
                      <p className="text-taupe text-xs">
                        after AED {Number(order.creditApplied).toLocaleString()} credit
                      </p>
                    )}
                    {order.shippingName && (
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="text-taupe text-xs hover:text-charcoal mt-2 underline"
                      >
                        {expanded === order.id ? 'Hide address' : 'View address'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              {expanded === order.id && order.shippingName && (
                <div className="border-t border-taupe/15 px-5 py-4 bg-taupe/10">
                  <p className="text-taupe text-xs font-semibold uppercase tracking-wide mb-2">Delivery Address</p>
                  <div className="text-charcoal text-sm space-y-0.5">
                    <p>{order.shippingName}</p>
                    {order.shippingPhone && <p className="text-taupe text-xs">{order.shippingPhone}</p>}
                    <p>{order.shippingAddress}</p>
                    <p>{order.shippingCity}, {order.shippingCountry}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  )
}
