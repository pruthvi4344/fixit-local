import { useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import ProviderDetail from './pages/ProviderDetail.jsx'
import MyBookings from './pages/MyBookings.jsx'
import ProviderDashboard from './pages/ProviderDashboard.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Review from './pages/Review.jsx'
import Favourites from './pages/Favourites.jsx'
import UserHistory from './pages/UserHistory.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Team from './pages/Team.jsx'
import client from './api/client.js'

// Scroll to #section links (e.g. /#services), or to the top on page change.
function ScrollManager() {
  const { pathname, hash, key, state } = useLocation()

  useEffect(() => {
    if (state?.keepScroll) return // filtering the services page shouldn't jump to the top
    const target = hash && document.getElementById(hash.slice(1))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash, key, state])

  return null
}

// Every page except the full-width ones (home, services, profile) sits in a padded container below the fixed navbar.
function PageLayout() {
  return (
    <div className="container-xl page-body">
      <Outlet />
    </div>
  )
}

export default function App() {
  // Count one visit each time the site is opened (for My History).
  useEffect(() => {
    client.get('/history/visit/').catch(() => {})
  }, [])

  return (
    // reducedMotion="user" turns animations off for people who ask their device for that.
    <MotionConfig reducedMotion="user">
      <ScrollManager />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/providers/:id" element={<ProviderDetail />} />

          <Route element={<PageLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/history" element={<UserHistory />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/review/:bookingId" element={<Review />} />
              <Route path="/favourites" element={<Favourites />} />
            </Route>

            <Route element={<ProtectedRoute role="provider" />}>
              <Route path="/dashboard" element={<ProviderDashboard />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <Footer />
    </MotionConfig>
  )
}
