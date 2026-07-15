import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, adjustUserCredit } from '../../features/admin/adminSlice'
import Loader from '../../components/common/Loader'

function CreditModal({ user, onClose }) {
  const dispatch = useDispatch()
  const { loading } = useSelector(s => s.admin)
  const [amount, setAmount]         = useState('')
  const [reason, setReason]         = useState('')
  const [note,   setNote]           = useState('')
  const [error,  setError]          = useState(null)
  const [done,   setDone]           = useState(false)

  const onSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      const auditNote = [
        'Target: Wallet Balance',
        `Reason: ${reason || 'Manual admin adjustment'}`,
        `Timestamp: ${new Date().toISOString()}`,
        note ? `Note: ${note}` : null,
      ].filter(Boolean).join(' | ')
      await dispatch(adjustUserCredit({ userId: user.id, amount: Number(amount), note: auditNote })).unwrap()
      setDone(true)
    } catch (err) {
      setError(err || 'Failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-almost-black/80">
      <div className="bg-white border border-taupe/15 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-charcoal font-semibold">Adjust Wallet Balance — {user.name}</h3>
          <button onClick={onClose} className="text-taupe hover:text-charcoal text-xl">×</button>
        </div>

        {done ? (
          <div className="text-center py-4">
            <p className="text-emerald font-semibold">Credit adjusted successfully.</p>
            <button onClick={onClose} className="mt-4 text-taupe text-sm hover:text-charcoal">Close</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-lg px-4 py-3">{error}</div>}

            <div className="rounded-lg border border-gold/20 bg-gold/8 px-3 py-2 text-[11px] text-taupe">
              Manual adjustments apply to <strong className="text-charcoal">Wallet Balance</strong>. Reward Credits are displayed separately and should be issued through auction reward/refund flows.
            </div>

            <div>
              <label className="block text-taupe text-xs mb-1">Amount (AED) — use negative to deduct</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full bg-white border border-taupe/30 text-charcoal rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-taupe text-xs mb-1">Reason *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                className="w-full bg-white border border-taupe/30 text-charcoal rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">Select reason</option>
                <option value="Auction reward">Auction reward</option>
                <option value="Ticket refund">Ticket refund</option>
                <option value="Payment correction">Payment correction</option>
                <option value="Customer support adjustment">Customer support adjustment</option>
                <option value="Promotional credit">Promotional credit</option>
              </select>
              <p className="text-[11px] text-taupe mt-1">Saved with admin action timestamp in the adjustment note.</p>
            </div>

            <div>
              <label className="block text-taupe text-xs mb-1">Admin note</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Internal note for audit trail"
                className="w-full bg-white border border-taupe/30 text-charcoal rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="text-taupe text-sm hover:text-charcoal px-4 py-2">Cancel</button>
              <button type="submit" disabled={loading} className="bg-gold text-almost-black font-semibold px-6 py-2 rounded-lg hover:bg-gold/90 disabled:opacity-50 text-sm">
                {loading ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const dispatch = useDispatch()
  const { users, loading } = useSelector(s => s.admin)
  const [creditTarget, setCreditTarget] = useState(null)

  useEffect(() => { dispatch(fetchAllUsers()) }, [])

  if (loading) return <Loader text="Loading users…" />

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-emerald rounded-full" />
        <h2 className="font-display text-charcoal text-2xl font-semibold">Users <span className="text-taupe text-lg font-normal">({users.length})</span></h2>
      </div>

      <div className="bg-white border border-taupe/15 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-taupe/5 border-b border-taupe/15 text-left">
                <th className="px-4 py-3 text-taupe font-medium">User</th>
                <th className="px-4 py-3 text-taupe font-medium hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-taupe font-medium hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-taupe font-medium">Balances</th>
                <th className="px-4 py-3 text-taupe font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-taupe/10 last:border-0 hover:bg-taupe/10 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-charcoal">{u.name}</p>
                    <p className="text-taupe text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-gold/10 text-gold' : 'bg-taupe/10 text-taupe'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-taupe hidden md:table-cell text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-charcoal text-xs font-semibold">
                        Wallet: AED {u.walletBalance !== undefined ? Number(u.walletBalance).toLocaleString() : '—'}
                      </p>
                      <p className="text-gold text-xs font-semibold">
                        Reward Credits: AED {u.rewardCredits !== undefined ? Number(u.rewardCredits).toLocaleString() : '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setCreditTarget(u)}
                      className="text-xs bg-emerald/10 text-emerald hover:bg-emerald hover:text-ivory px-2.5 py-1 rounded-lg transition-colors font-medium"
                    >
                      Adjust Wallet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-taupe text-sm text-center py-10">No users found.</p>
          )}
        </div>
      </div>

      {creditTarget && (
        <CreditModal user={creditTarget} onClose={() => setCreditTarget(null)} />
      )}
    </div>
  )
}
