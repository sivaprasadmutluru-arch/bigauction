import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
import NotificationToast from './components/common/NotificationToast'
import WhatsAppButton from './components/common/WhatsAppButton'

import HomePage           from './pages/HomePage'
import AuctionsPage       from './pages/AuctionsPage'
import ProductDetailPage  from './pages/ProductDetailPage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import ProfilePage        from './pages/ProfilePage'
import WalletPage         from './pages/WalletPage'
import OrdersPage         from './pages/OrdersPage'
import CheckoutPage       from './pages/CheckoutPage'
import FavouritesPage    from './pages/FavouritesPage'
import HowItWorksPage    from './pages/HowItWorksPage'
import WinnersPage        from './pages/WinnersPage'
import AboutPage          from './pages/AboutPage'
import HelpPage           from './pages/HelpPage'
import NotFoundPage       from './pages/NotFoundPage'

import AdminLayout        from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage  from './pages/admin/AdminProductsPage'
import AdminAuctionsPage  from './pages/admin/AdminAuctionsPage'
import AdminOrdersPage    from './pages/admin/AdminOrdersPage'
import AdminUsersPage     from './pages/admin/AdminUsersPage'
import AdminReportsPage    from './pages/admin/AdminReportsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminDepositsPage   from './pages/admin/AdminDepositsPage'

function ScrollToRoutePosition() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      window.setTimeout(() => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (target) target.scrollIntoView({ block: 'start' })
        else window.scrollTo({ top: 0, left: 0 })
      }, 0)
      return
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, search, hash])

  return null
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <ScrollToRoutePosition />
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/auctions"      element={<AuctionsPage />} />
          <Route path="/products/:id"  element={<ProductDetailPage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/how-it-works"  element={<HowItWorksPage />} />
          <Route path="/winners"       element={<WinnersPage />} />
          <Route path="/about"         element={<AboutPage />} />
          <Route path="/help"          element={<HelpPage />} />

          {/* Protected — any logged-in user */}
          <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/wallet"   element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/orders"      element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index           element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="auctions" element={<AdminAuctionsPage />} />
            <Route path="orders"     element={<AdminOrdersPage />} />
            <Route path="deposits"   element={<AdminDepositsPage />} />
            <Route path="users"      element={<AdminUsersPage />} />
            <Route path="reports"    element={<AdminReportsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <NotificationToast />
      <WhatsAppButton />
    </div>
  )
}
