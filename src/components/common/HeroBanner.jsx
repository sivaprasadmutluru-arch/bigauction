import { Link } from 'react-router-dom'
import heroImg from '../../assets/hero.png'

const TRUST = [
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    line1: '100% Authentic',
    line2: 'Luxury Items',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    line1: 'Transparent',
    line2: 'Auctions',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    line1: 'Secure Payments',
    line2: '& Your Privacy',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    line1: 'Fast & Insured',
    line2: 'Delivery Across UAE',
  },
]

export default function HeroBanner() {
  return (
    <section className="bg-ivory overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center py-10 sm:py-14 lg:py-0 lg:min-h-[500px]">

          {/* Left: text */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-charcoal text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
              Exclusive luxury.<br />Unbeatable excitement.
            </h1>
            <p className="text-taupe text-sm sm:text-base mt-4 sm:mt-5 leading-relaxed max-w-md">
              Premium items. Transparent auctions.<br />Your next luxury find is here.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                to="/auctions"
                className="inline-flex items-center gap-2 bg-charcoal text-ivory font-bold px-6 py-3 rounded text-sm hover:bg-emerald transition-colors uppercase tracking-wide"
              >
                Explore Auctions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 border border-charcoal text-charcoal font-semibold px-6 py-3 rounded text-sm hover:border-emerald hover:text-emerald transition-colors uppercase tracking-wide"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                    <polygon points="3,1 9,5 3,9" />
                  </svg>
                </span>
                How It Works
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-10 pt-8 border-t border-taupe/15">
              {TRUST.map(t => (
                <div key={t.line1} className="flex items-center gap-3 rounded-lg bg-white/80 border border-gold/20 px-4 py-3 shadow-sm">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald">
                    <div className="[&>svg]:w-6 [&>svg]:h-6">{t.icon}</div>
                  </div>
                  <div>
                    <p className="text-charcoal text-sm font-bold leading-snug">{t.line1}</p>
                    <p className="text-taupe text-xs leading-snug mt-0.5">{t.line2}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero image */}
          <div className="hidden lg:flex items-end justify-end h-full">
            <img
              src={heroImg}
              alt="Luxury auction"
              className="w-full max-w-lg object-contain object-bottom"
              style={{ maxHeight: '500px' }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
