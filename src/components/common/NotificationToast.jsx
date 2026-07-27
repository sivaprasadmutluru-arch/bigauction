import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useUserNotifications from '../../hooks/useUserNotifications'

const TYPE_CONFIG = {
  OUTBID: {
    icon: '⚡',
    bg: 'bg-burgundy',
    label: 'Outbid',
  },
  AUCTION_WON: {
    icon: '🏆',
    bg: 'bg-emerald',
    label: 'You Won!',
  },
  AUCTION_CLOSED: {
    icon: '◆',
    bg: 'bg-taupe',
    label: 'Auction Ended',
  },
  AUTO_BID_MAX_REACHED: {
    icon: '🤖',
    bg: 'bg-gold',
    label: 'Auto Bid Limit Reached',
  },
  ORDER_STATUS: {
    icon: '📦',
    bg: 'bg-emerald',
    label: 'Order Update',
  },
}

let nextId = 1

export default function NotificationToast() {
  const { user } = useSelector(s => s.auth)
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const onNotification = useCallback(notification => {
    const id = nextId++
    setToasts(prev => [...prev, { ...notification, id }])
    // Auto-dismiss after 8 seconds
    setTimeout(() => dismiss(id), 8000)
  }, [dismiss])

  useUserNotifications(user?.id, onNotification)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map(toast => {
        const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.AUCTION_CLOSED
        return (
          <div
            key={toast.id}
            className="bg-white border border-taupe/20 rounded-2xl shadow-luxury overflow-hidden animate-fade-up"
          >
            {/* Coloured top strip */}
            <div className={`h-1 ${cfg.bg}`} />

            <div className="p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-charcoal text-xs font-semibold uppercase tracking-widest mb-0.5">{cfg.label}</p>
                <p className="text-charcoal text-sm leading-snug">{toast.message}</p>
                {toast.type === 'AUCTION_WON' && toast.auctionId && (
                  <Link
                    to={`/auctions`}
                    className="mt-2 inline-block text-xs text-gold font-semibold hover:underline"
                    onClick={() => dismiss(toast.id)}
                  >
                    Complete checkout →
                  </Link>
                )}
                {(toast.type === 'OUTBID' || toast.type === 'AUTO_BID_MAX_REACHED') && toast.auctionId && (
                  <Link
                    to={`/auctions`}
                    className="mt-2 inline-block text-xs text-gold font-semibold hover:underline"
                    onClick={() => dismiss(toast.id)}
                  >
                    {toast.type === 'AUTO_BID_MAX_REACHED' ? 'Update auto bid →' : 'Bid again →'}
                  </Link>
                )}
                {toast.type === 'ORDER_STATUS' && (
                  <Link
                    to={`/orders`}
                    className="mt-2 inline-block text-xs text-gold font-semibold hover:underline"
                    onClick={() => dismiss(toast.id)}
                  >
                    View My Orders →
                  </Link>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-taupe hover:text-charcoal text-lg leading-none flex-shrink-0 mt-0.5"
              >
                ×
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
