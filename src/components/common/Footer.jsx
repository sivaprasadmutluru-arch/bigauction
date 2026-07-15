import { Link } from 'react-router-dom'
import logo from '../../assets/big-auction-logo.png'

const FOOTER_COLS = [
  {
    title: 'Auctions',
    links: [
      { label: 'Coming Soon',        to: '/auctions?status=PENDING' },
      { label: 'Live Auctions',      to: '/auctions?status=ACTIVE' },
      { label: 'Completed Auctions', to: '/auctions?status=CLOSED' },
      { label: 'All Auctions',       to: '/auctions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',    to: '/about' },
      { label: 'How It Works',to: '/how-it-works' },
      { label: 'Winners',     to: '/winners' },
      { label: 'Help',        to: '/help' },
      { label: 'Careers',     to: '/about' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Help Center',         to: '/help' },
      { label: 'Contact Us',          to: '/help' },
      { label: 'Shipping & Delivery', to: '/help#delivery---pickup' },
      { label: 'Returns & Refunds',   to: '/help#payments' },
      { label: 'FAQs',                to: '/help' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions',    to: '/#terms' },
      { label: 'Privacy Policy',        to: '/#privacy' },
      { label: 'Auction Rules',         to: '/#rules' },
      { label: 'Refund & Credit Policy',to: '/#refund' },
      { label: 'Cookie Policy',         to: '/#cookies' },
    ],
  },
]

const SOCIALS = [
  {
    label: 'Facebook',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.17 8.17 0 004.78 1.52V6.57a4.85 4.85 0 01-1.01.12z" />
      </svg>
    ),
  },
]

const BOTTOM_TRUST = [
  {
    icon: (
      <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    line1: 'Secure Payments',
    line2: '100% Protected',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    line1: 'Verified Luxury Items',
    line2: 'Authentic & Inspected',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    line1: 'UAE Wide Delivery',
    line2: '',
  },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-taupe/15 mt-auto">

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <img src={logo} alt="Big Auction" className="h-12 w-auto mb-3" />
            <p className="text-taupe text-xs leading-relaxed max-w-[200px]">
              The UAE's trusted platform for premium luxury auctions. Transparent, secure and exciting.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {SOCIALS.map(s => (
                <a key={s.label} href="#" aria-label={s.label}
                  className="w-7 h-7 rounded-full border border-taupe/25 flex items-center justify-center text-taupe hover:text-emerald hover:border-emerald transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <div className="bg-emerald/10 border border-emerald/30 rounded px-2 py-1">
                <p className="text-emerald text-[10px] font-bold uppercase tracking-wide">TDRA Approved</p>
                <p className="text-taupe text-[9px] mt-0.5">ER123456/24</p>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <p className="text-charcoal text-xs font-bold uppercase tracking-[0.12em] mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-taupe text-xs hover:text-emerald transition-colors leading-snug">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <p className="text-charcoal text-xs font-bold uppercase tracking-[0.12em] mb-4">Contact Us</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span className="text-taupe text-xs">+971 50 123 4567</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-taupe text-xs">hello@bigauction.ae</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-taupe text-xs">Dubai, United Arab Emirates</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom trust bar */}
      <div className="border-t border-taupe/15 bg-ivory/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
              {BOTTOM_TRUST.map(t => (
                <div key={t.line1} className="flex items-center gap-2">
                  {t.icon}
                  <div>
                    <p className="text-charcoal text-[11px] font-semibold leading-tight">{t.line1}</p>
                    {t.line2 && <p className="text-taupe text-[10px] leading-tight">{t.line2}</p>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-taupe/60 text-[11px]">
              © {new Date().getFullYear()} Big Auction. All rights reserved.
            </p>
          </div>
        </div>
      </div>

    </footer>
  )
}
