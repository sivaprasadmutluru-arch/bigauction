import { Fragment, useEffect } from 'react'
import logo from '../../assets/bid-auction.png'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { logout } from '../../features/auth/authSlice'
import { fetchWallet } from '../../features/wallet/walletSlice'

const NAV_LINKS = [
  { label: 'Auctions',     to: '/auctions' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Winners',      to: '/winners' },
  { label: 'Authenticity', to: '/about' },
  { label: 'Help',         to: '/help' },
]

const USER_MENU = [
  { label: 'My Profile', to: '/profile' },
  { label: 'My Wallet',  to: '/wallet' },
  { label: 'My Orders',  to: '/orders' },
]

function HamburgerIcon({ open }) {
  return (
    <span className="flex flex-col justify-center items-center w-6 h-6 gap-1.5">
      <span className={`block h-0.5 w-6 bg-charcoal transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
      <span className={`block h-0.5 w-6 bg-charcoal transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
      <span className={`block h-0.5 w-6 bg-charcoal transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
    </span>
  )
}

export default function Navbar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { user }   = useSelector(s => s.auth)
  const { wallet } = useSelector(s => s.wallet)

  useEffect(() => { if (user) dispatch(fetchWallet()) }, [user])

  const handleLogout = () => { dispatch(logout()); navigate('/') }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const publicDisplayName = user?.nickname || user?.name?.split(' ')[0] || 'Member'

  return (
    <Disclosure as="nav" className="bg-white border-b border-taupe/15 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <img src={logo} alt="Big Auction" className="h-11 sm:h-12 w-auto" />
              </Link>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map(l => (
                  <NavLink
                    key={l.label}
                    to={l.to}
                    className={({ isActive }) =>
                      `relative text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-emerald bg-emerald/6'
                          : 'text-charcoal hover:text-emerald hover:bg-emerald/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {l.label}
                        {isActive && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald rounded-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">

                {user ? (
                  <>
                    <div className="hidden md:block text-right leading-tight">
                      <p className="text-sm font-semibold text-emerald">Hello, {publicDisplayName}</p>
                      <p className="text-[10px] text-taupe">Signed in privately</p>
                    </div>
                    <Link to="/wallet" className="hidden sm:block text-sm text-charcoal font-medium hover:text-emerald transition-colors">
                      AED {wallet ? Number(wallet.balance).toLocaleString() : '0'}
                    </Link>

                    <Menu as="div" className="relative">
                      <Menu.Button className="w-9 h-9 rounded-full bg-emerald text-ivory text-sm font-semibold flex items-center justify-center hover:ring-2 hover:ring-gold transition-all">
                        {initials}
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-taupe/20 rounded-lg shadow-xl focus:outline-none overflow-hidden">
                          <div className="px-4 py-3 border-b border-taupe/20">
                            <p className="text-charcoal text-sm font-medium truncate">Hello, {publicDisplayName}</p>
                            <p className="text-taupe text-xs">Private account</p>
                          </div>
                          {USER_MENU.map(item => (
                            <Menu.Item key={item.to}>
                              {({ active }) => (
                                <Link to={item.to} className={`block px-4 py-2.5 text-sm transition-colors ${active ? 'bg-taupe/10 text-gold' : 'text-charcoal'}`}>
                                  {item.label}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                          {user.role === 'ADMIN' && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link to="/admin" className={`block px-4 py-2.5 text-sm border-t border-taupe/20 transition-colors ${active ? 'bg-taupe/10 text-gold' : 'text-gold/80'}`}>
                                  Admin Panel
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                          <Menu.Item>
                            {({ active }) => (
                              <button onClick={handleLogout} className={`w-full text-left px-4 py-2.5 text-sm border-t border-taupe/20 transition-colors ${active ? 'bg-taupe/10 text-burgundy' : 'text-taupe'}`}>
                                Sign Out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link to="/login" className="text-sm font-semibold text-charcoal hover:text-emerald transition-colors px-3 py-1.5 uppercase tracking-wide">
                      Login
                    </Link>
                    <Link to="/register" className="text-sm font-bold bg-emerald text-ivory px-5 py-2 rounded hover:bg-emerald/90 transition-colors uppercase tracking-wide">
                      Create Account
                    </Link>
                  </div>
                )}

                {/* Hamburger */}
                <Disclosure.Button className="lg:hidden p-1 rounded">
                  <HamburgerIcon open={open} />
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile panel */}
          <Disclosure.Panel className="lg:hidden border-t border-taupe/20 bg-white">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(l => (
                <NavLink key={l.label} to={l.to}>
                  {({ isActive }) => (
                    <Disclosure.Button
                      as="span"
                      className={`block px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                        isActive ? 'text-emerald bg-emerald/6 font-medium' : 'text-charcoal hover:bg-taupe/10'
                      }`}
                    >
                      {l.label}
                    </Disclosure.Button>
                  )}
                </NavLink>
              ))}
              {!user ? (
                <div className="border-t border-taupe/20 pt-3 mt-2 space-y-2">
                  <Disclosure.Button as={Link} to="/login" className="block px-3 py-2 text-sm text-center font-semibold text-charcoal border border-taupe/30 rounded">
                    Login
                  </Disclosure.Button>
                  <Disclosure.Button as={Link} to="/register" className="block px-3 py-2 text-sm text-center font-bold bg-emerald text-ivory rounded">
                    Create Account
                  </Disclosure.Button>
                </div>
              ) : (
                <>
                  <div className="border-t border-taupe/20 px-3 pt-3 mt-2">
                    <p className="text-sm font-semibold text-emerald">Hello, {publicDisplayName}</p>
                    <p className="text-xs text-taupe">You are signed in privately</p>
                  </div>
                  <div className="border-t border-taupe/20 pt-2 mt-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs text-taupe">Wallet Balance</span>
                      <Disclosure.Button as={Link} to="/wallet" className="text-sm font-semibold text-emerald hover:text-emerald/80 transition-colors">
                        AED {wallet ? Number(wallet.balance).toLocaleString() : '0'}
                      </Disclosure.Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {USER_MENU.map(item => (
                      <Disclosure.Button key={item.to} as={Link} to={item.to}
                        className="block px-3 py-2 rounded text-sm text-charcoal hover:bg-taupe/10 transition-colors"
                      >
                        {item.label}
                      </Disclosure.Button>
                    ))}
                    {user.role === 'ADMIN' && (
                      <Disclosure.Button as={Link} to="/admin" className="block px-3 py-2 rounded text-sm text-gold hover:bg-taupe/10 transition-colors">
                        Admin Panel
                      </Disclosure.Button>
                    )}
                  </div>
                  <div className="border-t border-taupe/20 pt-2 mt-2">
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded text-sm text-taupe hover:bg-taupe/10 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
