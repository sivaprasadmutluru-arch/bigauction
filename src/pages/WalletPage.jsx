import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchWallet } from '../features/wallet/walletSlice'
import api from '../services/api'
import Loader from '../components/common/Loader'

const REASON_MAP = {
  TICKET_PURCHASE:      'Ticket purchase',
  TICKET_REFUND:        'Ticket refund',
  AUCTION_LOSS_CREDIT:  'Auction loss credit',
  BUY_NOW_PURCHASE:     'Buy Now purchase',
  AUCTION_WIN_PURCHASE: 'Auction checkout',
  ADMIN_ADJUSTMENT:     'Admin adjustment',
  WALLET_DEPOSIT:       'Wallet deposit',
}

const REWARD_REASONS = new Set(['AUCTION_LOSS_CREDIT'])

const STATUS_STYLE = {
  PENDING:  'bg-gold/10 text-gold',
  APPROVED: 'bg-emerald/10 text-emerald',
  REJECTED: 'bg-burgundy/10 text-burgundy',
}

// ── Bank details shown to user ───────────────────────────────────────
const BANK_DETAILS = [
  { label: 'Bank Name',       value: 'Emirates NBD' },
  { label: 'Account Name',    value: 'BigAuction.ae FZ LLC' },
  { label: 'Account Number',  value: '1234567890' },
  { label: 'IBAN',            value: 'AE070331234567890123456' },
  { label: 'Swift / BIC',     value: 'EBILAEAD' },
  { label: 'Currency',        value: 'AED' },
]

// ── Add Funds Modal ──────────────────────────────────────────────────
function AddFundsModal({ onClose, onSubmitted, initialAmount = '' }) {
  const [step, setStep] = useState('details') // 'details' | 'form'
  const [form, setForm] = useState({ amount: initialAmount ? String(initialAmount) : '', bankReference: '', userNote: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    if (!form.amount || !form.bankReference) { setError('Amount and bank reference are required.'); return }
    setLoading(true); setError(null)
    try {
      await api.post('/wallet/deposit-request', {
        amount: Number(form.amount),
        bankReference: form.bankReference,
        userNote: form.userNote || null,
      })
      onSubmitted()
    } catch (err) {
      setError(err.message || 'Submission failed')
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-white border border-taupe/30 text-charcoal placeholder-taupe/40 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-almost-black/80">
      <div className="bg-white border border-taupe/15 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-charcoal font-semibold">Top Up Wallet</h3>
          <button onClick={onClose} className="text-taupe hover:text-charcoal text-xl leading-none">×</button>
        </div>

        {step === 'details' && (
          <div className="space-y-5">
            <p className="text-taupe text-sm">Transfer the desired amount to the bank account below, then click <span className="text-charcoal font-medium">I've Transferred</span> to submit your reference number and credit your wallet.</p>

            <div className="bg-taupe/10 rounded-lg divide-y divide-taupe/10">
              {BANK_DETAILS.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span className="text-taupe">{label}</span>
                  <span className="text-charcoal font-mono">{value}</span>
                </div>
              ))}
            </div>

            <p className="text-taupe text-xs">Use your name or email as the payment reference. Once submitted, your wallet balance is credited immediately.</p>

            <button
              onClick={() => setStep('form')}
              className="w-full bg-gold text-almost-black font-bold py-3 rounded-lg hover:bg-gold/90 transition-colors"
            >
              I've Transferred — Credit Wallet
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-taupe text-xs mb-1">Amount Transferred (AED) *</label>
              <input type="number" name="amount" value={form.amount} onChange={onChange} min="1" required className={inputCls} placeholder="e.g. 500" />
            </div>
            <div>
              <label className="block text-taupe text-xs mb-1">Bank Transfer Reference / Receipt No. *</label>
              <input type="text" name="bankReference" value={form.bankReference} onChange={onChange} required className={inputCls} placeholder="e.g. TXN123456789" />
            </div>
            <div>
              <label className="block text-taupe text-xs mb-1">Additional Note (optional)</label>
              <textarea name="userNote" value={form.userNote} onChange={onChange} rows={2} className={inputCls} placeholder="Transfer date, bank name, etc." />
            </div>

            {error && (
              <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('details')} className="flex-1 text-taupe text-sm border border-taupe/30 rounded-lg py-3 hover:text-charcoal transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-gold text-almost-black font-bold py-3 rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors text-sm">
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Transaction Row ──────────────────────────────────────────────────
function TransactionRow({ tx }) {
  const isCredit  = tx.type === 'CREDIT'
  const isExpired = tx.expired
  const expiring  = tx.expiresAt && !isExpired

  return (
    <div className="flex items-start justify-between py-4 border-b border-taupe/10 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-charcoal text-sm">{REASON_MAP[tx.reason] || tx.reason}</p>
        {tx.note && <p className="text-taupe text-xs mt-0.5 truncate">{tx.note}</p>}
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-taupe text-xs">{new Date(tx.createdAt).toLocaleDateString()}</span>
          {expiring && (
            <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">
              Expires {new Date(tx.expiresAt).toLocaleDateString()}
            </span>
          )}
          {isExpired && (
            <span className="text-xs bg-taupe/10 text-taupe px-2 py-0.5 rounded-full line-through">Expired</span>
          )}
        </div>
      </div>
      <p className={`ml-4 font-semibold text-sm flex-shrink-0 ${isCredit ? 'text-emerald' : 'text-burgundy'}`}>
        {isCredit ? '+' : '−'}AED {Number(tx.amount).toLocaleString()}
      </p>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────
export default function WalletPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { wallet, loading } = useSelector(s => s.wallet)
  const returnTo = location.state?.returnTo
  const requiredAmount = Number(location.state?.requiredAmount || 0)

  const [showAddFunds, setShowAddFunds]     = useState(Boolean(location.state?.openTopUp))
  const [deposits, setDeposits]             = useState([])
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [stmtTab, setStmtTab]               = useState('wallet')

  useEffect(() => { dispatch(fetchWallet()) }, [])

  useEffect(() => {
    api.get('/wallet/deposit-requests')
      .then(res => setDeposits(res.data || []))
      .catch(() => {})
  }, [depositSuccess])

  const onDepositSubmitted = () => {
    setShowAddFunds(false)
    setDepositSuccess(s => !s)
    dispatch(fetchWallet())
  }

  if (loading && !wallet) return <Loader text="Loading wallet…" />

  const balance       = wallet ? Number(wallet.balance || 0) : 0
  const rewardCredits = wallet ? Number(wallet.rewardCredits || 0) : 0
  const txs           = wallet?.transactions || []

  const walletTxs = txs.filter(tx => !REWARD_REASONS.has(tx.reason))
  const rewardTxs = txs.filter(tx =>  REWARD_REASONS.has(tx.reason))

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Emerald Hero ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#064C3B' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-16">
          <p className="text-ivory/60 text-xs uppercase tracking-widest mb-1">My Wallet</p>
          <p className="text-ivory/45 text-sm mb-4">Manage your balance, credits, refunds, and eligible payments.</p>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-16">
            <div>
              <p className="text-ivory/50 text-xs mb-1 uppercase tracking-wider">Wallet Balance</p>
              <p className="text-ivory text-3xl sm:text-5xl font-bold font-display">AED {balance.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</p>
              <p className="text-ivory/40 text-xs mt-1">Cash balance available for eligible payments.</p>
            </div>
            <div>
              <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'rgba(198,169,114,0.7)' }}>Reward Credits</p>
              <p className="text-3xl sm:text-4xl font-bold font-display" style={{ color: '#C6A972' }}>AED {rewardCredits.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(198,169,114,0.55)' }}>Credits earned from refunds, rewards, or auction-related adjustments.</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddFunds(true)}
            className="mt-6 bg-ivory text-emerald font-bold px-5 py-2.5 rounded-lg hover:bg-ivory/90 transition-colors text-sm"
          >
            + Top Up Wallet
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {returnTo && (
          <div className="rounded-xl border border-emerald/25 bg-emerald/5 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-emerald text-sm font-semibold">Adding funds for {location.state?.returnLabel || 'your purchase'}</p>
              <p className="text-taupe text-xs mt-0.5">Return to the item when you’re ready to continue.</p>
            </div>
            <button
              onClick={() => navigate(returnTo, { state: { autoTicket: true } })}
              className="flex-shrink-0 border border-emerald/30 text-emerald text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-emerald/10 transition-colors"
            >
              Back to Purchase
            </button>
          </div>
        )}

        <div className="rounded-xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-charcoal">
          <p className="font-semibold mb-1">Credit Usage Rules</p>
          <p>Reward Credits cannot be withdrawn and may apply only to eligible purchases. They cannot be transferred, claimed as cash, or used for Buy Now or final item payments.</p>
        </div>

        {/* Deposit request history */}
        {deposits.length > 0 && (
          <div className="bg-white border border-taupe/15 rounded-xl p-6">
            <h2 className="text-charcoal font-semibold mb-4">Wallet Top-Ups</h2>
            <div className="space-y-3">
              {deposits.map(d => (
                <div key={d.id} className="flex items-center justify-between py-3 border-b border-taupe/10 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal text-sm font-medium">AED {Number(d.amount).toLocaleString()}</p>
                    <p className="text-taupe text-xs mt-0.5">Ref: {d.bankReference}</p>
                    {d.adminNote && <p className="text-taupe text-xs mt-0.5 italic">{d.adminNote}</p>}
                    <p className="text-taupe text-xs mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[d.status] || 'bg-taupe/10 text-taupe'}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Split Statements */}
        <div className="bg-white border border-taupe/15 rounded-xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-taupe/15">
            {[
              { key: 'wallet', label: 'Wallet Activity' },
              { key: 'reward', label: 'Reward Credits' },
            ].map(t => (
              <button key={t.key} onClick={() => setStmtTab(t.key)}
                className="flex-1 py-3.5 text-sm font-semibold transition-colors"
                style={stmtTab === t.key
                  ? { color: '#064C3B', borderBottom: '2px solid #064C3B' }
                  : { color: '#8A8176' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {stmtTab === 'wallet' ? (
              walletTxs.length === 0
                ? <p className="text-taupe text-sm text-center py-8">No wallet transactions yet.</p>
                : walletTxs.map((tx, i) => <TransactionRow key={tx.id || i} tx={tx} />)
            ) : (
              rewardTxs.length === 0
                ? (
                  <div className="text-center py-8">
                    <p className="text-taupe text-sm">No reward credits yet.</p>
                    <p className="text-taupe/60 text-xs mt-1">Credits are issued when you don't win an auction.</p>
                  </div>
                )
                : rewardTxs.map((tx, i) => <TransactionRow key={tx.id || i} tx={tx} />)
            )}
          </div>
        </div>

      </div>

      {showAddFunds && (
        <AddFundsModal
          initialAmount={requiredAmount || ''}
          onClose={() => setShowAddFunds(false)}
          onSubmitted={onDepositSubmitted}
        />
      )}
    </div>
  )
}
