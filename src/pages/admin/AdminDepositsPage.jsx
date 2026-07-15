import { useEffect, useState } from 'react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const STATUS_STYLE = {
  PENDING:  'bg-gold/10 text-gold',
  APPROVED: 'bg-emerald/10 text-emerald',
  REJECTED: 'bg-burgundy/10 text-burgundy',
}

function ActionModal({ deposit, action, onClose, onDone }) {
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await api.post(`/admin/deposit-requests/${deposit.id}/${action}`, { note: note || null })
      onDone()
    } catch (err) {
      setError(err.message || 'Failed')
      setLoading(false)
    }
  }

  const isApprove = action === 'approve'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-almost-black/80">
      <div className="bg-white border border-taupe/15 rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-charcoal font-semibold">{isApprove ? 'Approve' : 'Reject'} Deposit</h3>
          <button onClick={onClose} className="text-taupe hover:text-charcoal text-xl leading-none">×</button>
        </div>

        <div className="bg-taupe/10 rounded-lg p-4 mb-4 space-y-1 text-sm">
          <p className="text-charcoal font-semibold">AED {Number(deposit.amount).toLocaleString()}</p>
          <p className="text-taupe">{deposit.userName} — {deposit.userEmail}</p>
          <p className="text-taupe">Ref: {deposit.bankReference}</p>
          {deposit.userNote && <p className="text-taupe italic">{deposit.userNote}</p>}
        </div>

        {isApprove && (
          <p className="text-emerald text-xs mb-4">
            This will immediately credit AED {Number(deposit.amount).toLocaleString()} to the user's wallet.
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-taupe text-xs mb-1">Note to user (optional)</label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full bg-white border border-taupe/30 text-charcoal rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
              placeholder={isApprove ? 'e.g. Transfer confirmed' : 'e.g. Reference not found'}
            />
          </div>

          {error && (
            <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 text-taupe text-sm border border-taupe/30 rounded-lg py-2.5 hover:text-charcoal transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className={`flex-1 font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors ${isApprove ? 'bg-emerald text-ivory hover:bg-emerald/90' : 'bg-burgundy text-ivory hover:bg-burgundy/90'}`}>
              {loading ? 'Processing…' : (isApprove ? 'Approve & Credit' : 'Reject')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('PENDING')
  const [modal, setModal]         = useState(null) // { deposit, action }

  const load = () => {
    setLoading(true)
    api.get('/admin/deposit-requests')
      .then(res => setDeposits(res.data || []))
      .catch(() => setDeposits([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const onDone = () => {
    setModal(null)
    load()
  }

  const filtered = filter === 'ALL' ? deposits : deposits.filter(d => d.status === filter)
  const pendingCount = deposits.filter(d => d.status === 'PENDING').length

  if (loading) return <Loader text="Loading deposit requests…" />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-emerald rounded-full" />
          <div>
            <h2 className="font-display text-charcoal text-2xl font-semibold">
              Wallet Deposit Requests
              {pendingCount > 0 && (
                <span className="ml-2 bg-burgundy text-ivory text-xs font-bold px-2 py-0.5 rounded-full align-middle">{pendingCount}</span>
              )}
            </h2>
            <p className="text-taupe text-xs mt-1">
              Bank-transfer wallet top-ups only. Refunds, delivery issues, and support requests should remain in their own workflows.
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${filter === s ? 'bg-emerald text-ivory' : 'text-taupe hover:text-charcoal bg-white border border-taupe/20'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-taupe/15 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-taupe text-sm text-center py-10">No {filter.toLowerCase()} deposit requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-taupe/5 border-b border-taupe/15 text-left">
                  <th className="px-4 py-3 text-taupe font-medium">User</th>
                  <th className="px-4 py-3 text-taupe font-medium">Amount</th>
                  <th className="px-4 py-3 text-taupe font-medium hidden sm:table-cell">Bank Reference</th>
                  <th className="px-4 py-3 text-taupe font-medium hidden md:table-cell">User/Admin Note</th>
                  <th className="px-4 py-3 text-taupe font-medium hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-taupe font-medium">Status</th>
                  <th className="px-4 py-3 text-taupe font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-taupe/10 last:border-0 hover:bg-taupe/10 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-charcoal">{d.userName}</p>
                      <p className="text-taupe text-xs">{d.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal font-semibold">
                      AED {Number(d.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-taupe font-mono text-xs hidden sm:table-cell">{d.bankReference}</td>
                    <td className="px-4 py-3 text-taupe text-xs hidden md:table-cell max-w-[150px] truncate">
                      {d.userNote || d.adminNote || '—'}
                    </td>
                    <td className="px-4 py-3 text-taupe text-xs hidden lg:table-cell">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[d.status] || ''}`}>
                        {d.status}
                      </span>
                      <p className="text-[10px] text-taupe mt-1">
                        {d.status === 'PENDING' ? 'Needs bank reference review' : d.status === 'APPROVED' ? 'Wallet credited' : 'Rejected, no wallet credit'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {d.status === 'PENDING' && (
                          <>
                            <button onClick={() => setModal({ deposit: d, action: 'approve' })}
                              className="text-xs text-emerald hover:underline">
                              Approve
                            </button>
                            <button onClick={() => setModal({ deposit: d, action: 'reject' })}
                              className="text-xs text-burgundy hover:underline">
                              Reject
                            </button>
                          </>
                        )}
                        {d.status !== 'PENDING' && (
                          <span className="text-taupe text-xs">{d.adminNote || '—'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ActionModal
          deposit={modal.deposit}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={onDone}
        />
      )}
    </div>
  )
}
