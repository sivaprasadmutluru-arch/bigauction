import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, updateOrderStatus } from '../../features/admin/adminSlice'
import Loader from '../../components/common/Loader'

const STATUSES = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']

const STATUS_STYLE = {
  PENDING:   'bg-gold/10 text-gold',
  CONFIRMED: 'bg-emerald/10 text-emerald',
  DELIVERED: 'bg-emerald/20 text-emerald',
  CANCELLED: 'bg-burgundy/10 text-burgundy',
}

const STATUS_HELP = {
  PENDING: 'Awaiting payment or admin confirmation',
  CONFIRMED: 'Paid or verified; prepare fulfilment',
  DELIVERED: 'Completed delivery or handover',
  CANCELLED: 'Cancelled or refund handled separately',
}

const statusLabel = status => (status || '—').replace(/_/g, ' ')

export default function AdminOrdersPage() {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector(s => s.admin)

  useEffect(() => { dispatch(fetchAllOrders()) }, [])

  const onStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }))
  }

  if (loading) return <Loader text="Loading orders…" />

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-emerald rounded-full" />
        <div>
          <h2 className="font-display text-charcoal text-2xl font-semibold">All Orders <span className="text-taupe text-lg font-normal">({orders.length})</span></h2>
          <p className="text-taupe text-xs mt-1">Use status deliberately: payment/admin confirmation, fulfilment, delivery, and cancellation are not the same step.</p>
        </div>
      </div>

      <div className="bg-white border border-taupe/15 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-taupe/5 border-b border-taupe/15 text-left">
                <th className="px-4 py-3 text-taupe font-medium">Customer</th>
                <th className="px-4 py-3 text-taupe font-medium">Product</th>
                <th className="px-4 py-3 text-taupe font-medium hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-taupe font-medium hidden md:table-cell">Amount</th>
                <th className="px-4 py-3 text-taupe font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-taupe/10 last:border-0 hover:bg-taupe/10 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-charcoal">{o.userName}</p>
                    <p className="text-taupe text-xs">{o.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-taupe">{o.productName || `#${o.id}`}</td>
                  <td className="px-4 py-3 text-taupe hidden sm:table-cell text-xs">{o.type?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-charcoal">AED {Number(o.totalAmount).toLocaleString()}</p>
                    {o.creditApplied > 0 && (
                      <p className="text-taupe text-xs">Credit: AED {Number(o.creditApplied).toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={e => onStatusChange(o.id, e.target.value)}
                      className={`text-xs font-medium rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer ${STATUS_STYLE[o.status] || ''}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </select>
                    <p className="text-[10px] text-taupe mt-1">{STATUS_HELP[o.status] || statusLabel(o.status)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-taupe text-sm text-center py-10">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
