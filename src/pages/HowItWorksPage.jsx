import { Link } from 'react-router-dom'

// ── Step sub-item card ─────────────────────────────────────────
function SubItem({ icon, title, text }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-charcoal font-semibold text-sm mb-1">{title}</p>
        <p className="text-taupe text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

// ── Callout box ────────────────────────────────────────────────
function Callout({ children }) {
  return (
    <div className="relative border-l-4 border-gold bg-gold/5 rounded-r-xl px-5 py-4 mt-6">
      <svg className="absolute top-3 right-4 w-8 h-8 text-gold/20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-charcoal text-sm leading-relaxed italic pr-8">{children}</p>
    </div>
  )
}

// ── Step number decoration ─────────────────────────────────────
function StepNumber({ n }) {
  return (
    <span className="font-display text-[120px] font-bold leading-none select-none text-gold/8 absolute -top-6 -left-4 pointer-events-none">
      {String(n).padStart(2, '0')}
    </span>
  )
}

// ── Connector between steps ────────────────────────────────────
function StepConnector() {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-px h-10 bg-gradient-to-b from-gold/40 to-transparent" />
      <svg className="w-4 h-4 text-gold/40 -mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

// ── Visual panel for each step ─────────────────────────────────
function Step1Visual() {
  return (
    <div className="bg-emerald rounded-3xl p-8 h-full flex flex-col justify-between gap-6 min-h-[360px]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gold" />
        <p className="text-gold text-xs font-semibold uppercase tracking-widest">Step 01</p>
      </div>
      <div className="flex flex-col gap-4">
        {[
          { label: 'Explore Products', icon: '🔍' },
          { label: 'Buy Your Ticket',  icon: '🎫' },
          { label: 'Set Your Strategy', icon: '🎯' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <span className="text-xl">{item.icon}</span>
            <p className="text-ivory text-sm font-medium">{item.label}</p>
            <svg className="ml-auto w-4 h-4 text-gold/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-4">
        <p className="text-ivory/50 text-xs">Secure payment gateway — Visa & Mastercard accepted</p>
      </div>
    </div>
  )
}

function Step2Visual() {
  const rows = [
    { rank: 1, name: 'Ahmed K.', bid: '4,200', active: true },
    { rank: 2, name: 'Sara M.',  bid: '4,100', active: false },
    { rank: 3, name: 'You',      bid: '3,950', active: false, isYou: true },
    { rank: 4, name: 'Omar R.',  bid: '3,800', active: false },
  ]
  return (
    <div className="bg-charcoal rounded-3xl p-6 min-h-[360px] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-ivory/60 text-xs font-semibold uppercase tracking-widest">Live Leaderboard</p>
        <div className="flex items-center gap-1.5 bg-emerald/80 rounded-full px-2.5 py-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ivory opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ivory" />
          </span>
          <span className="text-ivory text-[10px] font-bold uppercase tracking-wide">Live</span>
        </div>
      </div>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.rank} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.active ? 'bg-gold/20 border border-gold/30' : r.isYou ? 'bg-emerald/20 border border-emerald/30' : 'bg-white/5'}`}>
            <span className={`text-xs font-bold w-5 text-center ${r.active ? 'text-gold' : r.isYou ? 'text-emerald' : 'text-taupe'}`}>#{r.rank}</span>
            <span className={`text-sm flex-1 ${r.isYou ? 'text-emerald font-semibold' : 'text-ivory/80'}`}>{r.name}</span>
            <span className={`text-xs font-bold ${r.active ? 'text-gold' : r.isYou ? 'text-emerald' : 'text-ivory/50'}`}>AED {r.bid}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto bg-white/5 rounded-xl p-3 flex items-center justify-between gap-2">
        <p className="text-ivory/50 text-xs">Manual / Auto Bid</p>
        <div className="flex gap-1.5">
          <button className="bg-emerald text-ivory text-[10px] font-bold px-3 py-1.5 rounded uppercase">Manual</button>
          <button className="bg-white/10 text-ivory/50 text-[10px] font-bold px-3 py-1.5 rounded uppercase">Auto</button>
        </div>
      </div>
    </div>
  )
}

function Step3Visual() {
  return (
    <div className="bg-ivory border border-taupe/15 rounded-3xl p-8 min-h-[360px] flex flex-col justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald" />
        <p className="text-emerald text-xs font-semibold uppercase tracking-widest">You Won!</p>
      </div>
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald/30 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-emerald" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
          </svg>
        </div>
        <p className="font-display text-charcoal text-2xl font-semibold">Highest Bidder Wins</p>
        <p className="text-taupe text-xs">Your item is secured and ready for claim</p>
      </div>
      <div className="space-y-2">
        {[
          { icon: '💳', text: 'Pay securely via gateway' },
          { icon: '🏪', text: 'Pick up from Authorized Dealer' },
          { icon: '🚚', text: 'Or deliver to your doorstep' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 shadow-sm border border-taupe/10">
            <span>{item.icon}</span>
            <span className="text-charcoal text-xs font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-emerald relative overflow-hidden">
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #F2E7D5 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold/30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4">BigAuction.ae</p>
          <h1 className="font-display text-ivory text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            How It Works
          </h1>
          <p className="text-ivory/60 text-base max-w-xl mx-auto leading-relaxed">
            From discovering luxury items to claiming your win — here's everything you need to know to start your bidding adventure.
          </p>

          {/* Step pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              { n: '01', label: 'Prepare & Register' },
              { n: '02', label: 'Bid Live' },
              { n: '03', label: 'Claim & Receive' },
            ].map(s => (
              <div key={s.n} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2">
                <span className="text-gold font-bold text-xs">{s.n}</span>
                <span className="text-ivory text-xs font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">

        {/* ── STEP 1 ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Content */}
          <div className="relative">
            <StepNumber n={1} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center flex-shrink-0">
                  <span className="text-ivory text-xs font-bold">01</span>
                </div>
                <div className="h-px flex-1 bg-gold/20" />
              </div>
              <h2 className="font-display text-charcoal text-3xl sm:text-4xl font-semibold leading-tight mb-2">
                Starting Your Bidding Adventure
              </h2>
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-8">
                Prepare for an upcoming auction
              </p>

              <div className="space-y-6">
                <SubItem
                  icon={
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                    </svg>
                  }
                  title="Explore Products"
                  text="Discover our genuine and original products, all sourced from Authorized Dealers & Distributors in the UAE. Choose your favourite product to begin your bidding journey."
                />
                <SubItem
                  icon={
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                  }
                  title="Buy Your Ticket"
                  text="Click on the product or 'Login / Register' at the top-right corner of the website. Complete registration and purchase your ticket for the desired product through our secured payment gateway."
                />
                <SubItem
                  icon={
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  }
                  title="Choose Your Bidding Strategy"
                  text="Opt for Manual or Auto Bid, set your Maximum Bid Limit and Bid Increments, with the option to modify your strategy anytime before or during the auction."
                />
              </div>
            </div>
          </div>

          {/* Visual */}
          <Step1Visual />
        </div>

        <StepConnector />

        {/* ── STEP 2 ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Visual — left on desktop */}
          <div className="order-2 lg:order-1">
            <Step2Visual />
          </div>

          {/* Content — right on desktop */}
          <div className="relative order-1 lg:order-2">
            <StepNumber n={2} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center flex-shrink-0">
                  <span className="text-ivory text-xs font-bold">02</span>
                </div>
                <div className="h-px flex-1 bg-gold/20" />
              </div>
              <h2 className="font-display text-charcoal text-3xl sm:text-4xl font-semibold leading-tight mb-2">
                Joining the Live Auction
              </h2>
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-8">
                Compete in real-time
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    ),
                    text: 'Click on the live auction you want to follow.',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    ),
                    text: 'Monitor the Bidding Leaderboard in real-time.',
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M8.25 21V9m0 0L4.5 5.25M8.25 9l3.75-3.75m3.75 15V9m0 0l3.75-3.75M15.75 9l-3.75-3.75" />
                      </svg>
                    ),
                    text: 'Place your offers and adjust your strategy as needed. Switch between manual and automatic offers anytime.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center mt-0.5">
                      {item.icon}
                    </div>
                    <p className="text-taupe text-sm leading-relaxed pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>

              <Callout>
                No special skills required. Every offer keeps you in the running while the auction is live.
              </Callout>
            </div>
          </div>
        </div>

        <StepConnector />

        {/* ── STEP 3 ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Content */}
          <div className="relative">
            <StepNumber n={3} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center flex-shrink-0">
                  <span className="text-ivory text-xs font-bold">03</span>
                </div>
                <div className="h-px flex-1 bg-gold/20" />
              </div>
              <h2 className="font-display text-charcoal text-3xl sm:text-4xl font-semibold leading-tight mb-2">
                Claiming Your Product
              </h2>
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-8">
                The highest bidder wins
              </p>

              <div className="space-y-6">
                <SubItem
                  icon={
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  }
                  title="Pay the Bid Amount"
                  text="Complete your payment securely through our trusted payment gateway. Visa and Mastercard accepted."
                />
                <SubItem
                  icon={
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  }
                  title="Receive Your Item"
                  text="Choose to pick up the item from the Authorized Dealer / Distributor, or have it delivered directly to your doorstep across the UAE."
                />
              </div>
            </div>
          </div>

          {/* Visual */}
          <Step3Visual />
        </div>

      </section>

      {/* ── STATS STRIP ──────────────────────────────────────── */}
      <section className="bg-white border-y border-taupe/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                value: 'Up to 30%',
                label: 'Guaranteed Savings',
                sub: 'Win smarter, not harder',
                icon: (
                  <svg className="w-6 h-6 text-gold mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                  </svg>
                ),
              },
              {
                value: '100%',
                label: 'Authentic Products',
                sub: 'Sourced from UAE Authorized Dealers',
                icon: (
                  <svg className="w-6 h-6 text-gold mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                value: 'Zero',
                label: 'Special Skills Needed',
                sub: 'Anyone can bid and win',
                icon: (
                  <svg className="w-6 h-6 text-gold mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                ),
              },
            ].map(s => (
              <div key={s.label} className="space-y-1">
                {s.icon}
                <p className="font-display text-charcoal text-3xl font-semibold">{s.value}</p>
                <p className="text-emerald text-xs font-bold uppercase tracking-widest">{s.label}</p>
                <p className="text-taupe text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BIDDING STRATEGY EXPLAINER ───────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-gold text-xs font-semibold tracking-[0.25em] uppercase mb-2">Bidding Options</p>
          <h2 className="font-display text-charcoal text-3xl sm:text-4xl font-semibold">Choose Your Strategy</h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-gold text-xs">◆</span>
            <div className="h-px w-12 bg-gold/30" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Manual */}
          <div className="bg-white border border-taupe/15 rounded-2xl p-7 shadow-luxury hover:shadow-luxury-hover hover:border-gold/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l-.001-1.286a3.75 3.75 0 00-.369-1.61l-2.106-4.709a1.575 1.575 0 10-2.894 1.293l1.486 3.322" />
                </svg>
              </div>
              <div>
                <h3 className="text-charcoal font-semibold text-base">Manual Bid</h3>
                <p className="text-taupe text-xs">Full control, every step</p>
              </div>
            </div>
            <p className="text-taupe text-sm leading-relaxed">
              Place each bid yourself in real-time during the live auction. React to the leaderboard, adjust your amount and decide exactly when to bid.
            </p>
            <div className="mt-5 flex items-center gap-2 text-emerald text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Best for: engaged, competitive bidders
            </div>
          </div>
          {/* Auto */}
          <div className="bg-white border border-taupe/15 rounded-2xl p-7 shadow-luxury hover:shadow-luxury-hover hover:border-gold/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-charcoal font-semibold text-base">Auto Bid</h3>
                <p className="text-taupe text-xs">Set it and let it run</p>
              </div>
            </div>
            <p className="text-taupe text-sm leading-relaxed">
              Set your Maximum Bid Limit and Bid Increments — the system automatically places bids on your behalf up to your set limit. Switch to manual anytime.
            </p>
            <div className="mt-5 flex items-center gap-2 text-gold text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Best for: busy bidders who don't want to miss out
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-emerald">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4">Ready to Win?</p>
          <h2 className="font-display text-ivory text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Start Your Bidding Journey Today
          </h2>
          <p className="text-ivory/60 text-sm max-w-md mx-auto leading-relaxed mb-10">
            Join thousands of smart bidders winning premium luxury items at unbeatable prices. No special skills required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="btn-shimmer bg-gold-gradient text-almost-black font-bold px-8 py-3.5 rounded text-sm hover:opacity-90 transition-opacity uppercase tracking-wide shadow-lg shadow-gold/20"
            >
              Create Free Account
            </Link>
            <Link
              to="/auctions"
              className="border border-ivory/30 text-ivory font-semibold px-8 py-3.5 rounded text-sm hover:border-ivory/60 hover:bg-white/5 transition-colors uppercase tracking-wide"
            >
              Browse Auctions
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
