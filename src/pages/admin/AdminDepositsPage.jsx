import { useEffect, useState } from 'react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const STATUS_STYLE = {
  PENDING:  'bg-gold/10 text-gold',
  APPROVED: 'bg-emerald/10 text-emerald',
  REJECTED: 'bg-burgundy/10 text-burgundy',
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('APPROVED')

  const load = () => {
    setLoading(true)
    api.get('/admin/deposit-requests')
      .then(res => setDeposits(res.data || []))
      .catch(() => setDeposits([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'ALL' ? deposits : deposits.filter(d => d.status === filter)
  const pendingCount = deposits.filter(d => d.status === 'PENDING').length

  if (loading) return <Loader text="Loading wallet top-ups…" />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-emerald rounded-full" />
          <div>
            <h2 className="font-display text-charcoal text-2xl font-semibold">
              Wallet Top-Up History
              {pendingCount > 0 && (
                <span className="ml-2 bg-burgundy text-ivory text-xs font-bold px-2 py-0.5 rounded-full align-middle">{pendingCount}</span>
              )}
            </h2>
            <p className="text-taupe text-xs mt-1">
              User top-ups are credited automatically when the bank reference is submitted.
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
          <p className="text-taupe text-sm text-center py-10">No {filter.toLowerCase()} wallet top-ups.</p>
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
                        {d.status === 'PENDING' ? 'Legacy pending record' : d.status === 'APPROVED' ? 'Wallet credited automatically' : 'Rejected legacy record'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
