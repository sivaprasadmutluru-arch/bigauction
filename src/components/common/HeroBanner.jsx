import { useState } from 'react'
import { Link } from 'react-router-dom'
import ImageCarousel from './ImageCarousel'
import luxuryWatchImg from '../../assets/hero-luxury-watch-v3.png'
import luxuryBagImg from '../../assets/hero-luxury-bag-v3.png'
import luxuryJewelleryImg from '../../assets/hero-luxury-jewellery-v3.png'
import luxuryRingImg from '../../assets/hero-luxury-ring-v3.png'
import luxuryHandbagImg from '../../assets/hero-luxury-handbag-v1.png'
import luxuryGoldJewelleryImg from '../../assets/hero-luxury-gold-jewellery-v1.png'

const HERO_SLIDES = [
  {
    image: luxuryWatchImg, label: 'Watches', position: 'center', theme: 'light',
    title: ['Exclusive luxury.', 'Unbeatable excitement.'],
    copy: ['Luxury bags, watches, jewellery and rare finds.', 'Transparent auctions for your next statement piece.'],
  },
  {
    image: luxuryBagImg, label: 'Bags', position: 'center', theme: 'dark',
    title: ['Icons of style.', 'Made to be treasured.'],
    copy: ['Exceptional handbags. Verified authenticity.', 'Discover timeless craftsmanship.'],
  },
  {
    image: luxuryJewelleryImg, label: 'Jewellery', position: 'center', theme: 'light',
    title: ['Brilliance, curated.', 'Beauty without compromise.'],
    copy: ['Fine jewellery. Transparent auctions.', 'Find the piece that becomes your signature.'],
  },
  {
    image: luxuryRingImg, label: 'Diamond Rings', position: 'center', theme: 'dark',
    title: ['A timeless promise.', 'Crafted to captivate.'],
    copy: ['Exceptional rings. Verified authenticity.', 'Discover brilliance made to last.'],
  },
  {
    image: luxuryHandbagImg, label: 'Handbags', position: 'center', theme: 'light',
    title: ['Quiet luxury.', 'Ready for auction.'],
    copy: ['Curated handbags. Verified provenance.', 'Find statement pieces with confidence.'],
  },
  {
    image: luxuryGoldJewelleryImg, label: 'Gold Jewellery', position: 'center', theme: 'light',
    title: ['Golden details.', 'Lasting value.'],
    copy: ['Fine jewellery with polished presence.', 'Bid on pieces made to be remembered.'],
  },
]

const TRUST = [
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    line1: 'Authentic',
    line2: 'Verified luxury',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    line1: 'Transparent',
    line2: 'Final results',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    line1: 'Private',
    line2: 'Secure payment',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    line1: 'Insured',
    line2: 'UAE delivery',
  },
]

export default function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0)
  const active = HERO_SLIDES[activeSlide] || HERO_SLIDES[0]
  const dark = active.theme === 'dark'

  return (
    <section
      className="relative bg-[#f7f1e7] overflow-hidden"
      style={{ width: '100%', height: 'clamp(520px, 34vw, 650px)' }}
    >
      <ImageCarousel slides={HERO_SLIDES} onIndexChange={setActiveSlide} />
      <div className={`absolute inset-0 bg-gradient-to-r pointer-events-none ${dark ? 'from-[#061711]/95 via-[#061711]/80 to-transparent lg:via-[#061711]/20' : 'from-[#f7f1e7] via-[#f7f1e7]/95 to-transparent lg:via-[#f7f1e7]/35'}`} />
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-full lg:grid-cols-2 items-center py-12 sm:py-16 lg:py-0">

          {/* Left: text */}
          <div className="flex flex-col justify-center">
            <h1 className={`font-display text-4xl sm:text-5xl lg:text-[3.55rem] font-semibold leading-[1.03] tracking-tight ${dark ? 'text-ivory' : 'text-emerald'}`}>
              {active.title[0]}<br />{active.title[1]}
            </h1>
            <p className={`text-sm sm:text-base mt-4 sm:mt-5 leading-relaxed max-w-md ${dark ? 'text-ivory/75' : 'text-taupe'}`}>
              {active.copy[0]}<br />{active.copy[1]}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                to="/auctions"
                className={`inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-sm transition-colors uppercase tracking-wide ${dark ? 'bg-gold text-charcoal hover:bg-ivory' : 'bg-charcoal text-ivory hover:bg-emerald'}`}
              >
                Explore Auctions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/how-it-works"
                className={`inline-flex items-center gap-2 border font-semibold px-6 py-3 rounded text-sm transition-colors uppercase tracking-wide ${dark ? 'border-ivory/70 text-ivory hover:border-gold hover:text-gold' : 'border-charcoal text-charcoal hover:border-emerald hover:text-emerald'}`}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                    <polygon points="3,1 9,5 3,9" />
                  </svg>
                </span>
                How It Works
              </Link>
            </div>

            {/* Trust assurances */}
            <div className={`mt-9 inline-flex max-w-[700px] flex-wrap items-stretch rounded-md border px-3 py-2.5 shadow-[0_18px_45px_rgba(47,36,20,0.14)] backdrop-blur-md ${dark ? 'bg-[#f7f1e7]/12 border-gold/30' : 'bg-white/70 border-gold/25'}`}>
              {TRUST.map(t => (
                <div key={t.line1} className={`relative flex min-w-[136px] flex-1 items-center gap-2.5 px-2.5 py-1.5 after:absolute after:right-0 after:top-2 after:bottom-2 after:w-px after:bg-gold/25 last:after:hidden`}>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/25 [&_svg]:h-4 [&_svg]:w-4">{t.icon}</div>
                  <div className="min-w-0 text-left">
                    <p className={`text-[10px] font-bold leading-none uppercase tracking-[0.08em] ${dark ? 'text-ivory' : 'text-charcoal'}`}>{t.line1}</p>
                    <p className={`mt-1 text-[9px] leading-tight ${dark ? 'text-ivory/70' : 'text-taupe'}`}>{t.line2}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />

        </div>
      </div>
    </section>
  )
}
