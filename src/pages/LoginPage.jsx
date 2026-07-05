import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../features/auth/authSlice'

const MailIcon = () => <svg className="w-5 h-5 text-[#B0A090]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
const LockIcon = () => <svg className="w-5 h-5 text-[#B0A090]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
const EyeIcon = ({ open }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open
      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>
    }
  </svg>
)

const PERKS = [
  { title: 'Live Auction Access',     sub: 'Bid in real-time on luxury items.',          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/> },
  { title: 'Wallet & Credits',        sub: 'Instant credits when you participate.',       icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18-3V6"/> },
  { title: 'Order Tracking',          sub: 'Follow your wins from payment to door.',      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/> },
  { title: 'Exclusive Member Deals',  sub: 'Early access and private sale events.',       icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/> },
]

const TRUST = [
  { title: 'Secure Payments',     sub: 'Your transactions are 100% secure.',          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/> },
  { title: 'Verified Platform',   sub: 'Trusted by thousands of luxury lovers.',      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/> },
  { title: 'Fair & Transparent',  sub: 'Every bid is real and visible in real-time.', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/> },
  { title: 'Proudly in UAE',      sub: 'Local support and fast delivery.',             icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></> },
]

const lbl = 'text-xs font-semibold text-[#2C2C2C] leading-tight'
const inp = 'w-full text-sm text-[#2C2C2C] placeholder-[#B8ACA0] focus:outline-none bg-transparent mt-0.5'

const Field = ({ icon, children, right }) => (
  <div className="flex items-center gap-3 border border-[#E2D8CC] rounded-xl px-4 py-2.5 bg-white transition-colors">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">{children}</div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </div>
)

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, loading, error } = useSelector(s => s.auth)

  const from = location.state?.from?.pathname
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (user) {
      const destination = from && from !== '/'
        ? from
        : user.role === 'ADMIN' ? '/admin' : '/'
      navigate(destination, { replace: true })
    }
    return () => dispatch(clearError())
  }, [user, from, navigate, dispatch])

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const onSubmit = e => { e.preventDefault(); dispatch(login(form)) }

  return (
    /* ── Warm cream page background — same tone as the photo background ── */
    <div className="bg-[#EDE0CC] min-h-[calc(100vh-64px)]">

      {/* ── Main 3-column layout: image | text | form ── */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] lg:overflow-hidden">

        {/* ── COL 1: Product image ── */}
        <div className="hidden lg:block relative w-[30%] flex-shrink-0 overflow-hidden">
          <img src="/auth-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
          {/* Right edge fade into cream */}
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-[#EDE0CC]" />
        </div>

        {/* ── COL 2: Text / marketing ── */}
        <div className="hidden lg:flex flex-col justify-center w-[32%] flex-shrink-0 px-8 xl:px-10 overflow-y-auto py-8">

          {/* Crown */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#C6A972]/55" />
            <span className="text-[#C6A972] text-lg">♛</span>
            <div className="flex-1 h-px bg-[#C6A972]/55" />
          </div>

          <h1 className="font-display text-emerald text-3xl xl:text-4xl font-semibold leading-tight mb-2">
            Welcome back<br />to BigAuction
          </h1>
          <p className="text-charcoal/65 text-sm mb-6 leading-relaxed">
            Your next luxury win is waiting. Sign in and start bidding.
          </p>

          <div className="space-y-4 mb-5">
            {PERKS.map(p => (
              <div key={p.title} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-charcoal/15 bg-white/70 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-charcoal/55" fill="none" stroke="currentColor" viewBox="0 0 24 24">{p.icon}</svg>
                </div>
                <div>
                  <p className="text-charcoal font-semibold text-sm leading-tight">{p.title}</p>
                  <p className="text-charcoal/55 text-xs">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-charcoal/12 rounded-xl px-4 py-3 bg-white/60">
            <p className="text-charcoal/65 text-sm italic leading-relaxed">
              "Winning a Rolex through BigAuction was surreal — transparent, fair, and lightning fast."
            </p>
            <p className="text-[#C6A972] text-xs mt-1.5 font-medium">— Ahmed K., Dubai</p>
          </div>
        </div>

        {/* ── COL 3: Form ── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-4 lg:overflow-y-auto">
          <div className="w-full max-w-[490px] my-auto">

            <div className="bg-white rounded-2xl border border-[#E2D8CC] shadow-[0_2px_24px_rgba(0,0,0,0.07)] p-6 sm:p-7">

              <div className="text-center mb-5">
                <h2 className="font-display text-charcoal text-2xl font-semibold">Sign in to your account</h2>
                <p className="text-charcoal/55 text-sm mt-1.5 leading-relaxed">
                  Access your bids, wallet, and orders.
                </p>
              </div>

              {error && (
                <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-xs rounded-lg px-3 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} autoComplete="off" className="space-y-2">

                <Field icon={<MailIcon />} right={form.email && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, email: '' }))
                      dispatch(clearError())
                    }}
                    aria-label="Clear email address"
                    title="Clear email"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#A99E94] hover:text-charcoal hover:bg-[#F3EEE8] transition-colors text-xl leading-none"
                  >
                    ×
                  </button>
                )}>
                  <p className={lbl}>Email Address</p>
                  <input name="email" value={form.email} onChange={onChange} required type="email"
                    autoComplete="off" data-lpignore="true" data-1p-ignore="true"
                    placeholder="Enter your email address" className={inp} />
                </Field>

                <Field icon={<LockIcon />} right={
                  <button type="button" onClick={() => setShowPw(v => !v)} className="text-[#C8BEB5] hover:text-charcoal transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                }>
                  <p className={lbl}>Password</p>
                  <input name="password" value={form.password} onChange={onChange} required
                    autoComplete="new-password" data-lpignore="true" data-1p-ignore="true"
                    type={showPw ? 'text' : 'password'} placeholder="Enter your password" className={inp} />
                </Field>

                <button type="submit" disabled={loading}
                  className="w-full bg-emerald text-ivory font-semibold py-3 rounded-xl hover:bg-emerald/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 tracking-[0.1em] text-sm mt-1">
                  {loading ? 'Signing in…' : <>SIGN IN <span>→</span></>}
                </button>

                <p className="text-center text-charcoal/55 text-sm pt-1">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#C6A972] font-medium hover:underline">Create one</Link>
                </p>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="border-t border-[#D8CCBA] bg-[#E8D8C0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {TRUST.map((t, i) => (
            <div key={t.title} className={`flex items-start gap-3 ${i < 3 ? 'sm:border-r sm:border-[#D0C4AE] sm:pr-5' : ''}`}>
              <svg className="w-8 h-8 text-[#C6A972] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{t.icon}</svg>
              <div>
                <p className="text-charcoal font-semibold text-sm">{t.title}</p>
                <p className="text-charcoal/55 text-xs mt-0.5 leading-relaxed">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
