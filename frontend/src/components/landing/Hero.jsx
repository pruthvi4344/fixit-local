import { motion } from 'framer-motion'
import { FiMapPin, FiChevronDown, FiSearch, FiGrid } from 'react-icons/fi'
import { MdVerifiedUser } from 'react-icons/md'
import { FaDollarSign, FaStar, FaRegCalendarCheck } from 'react-icons/fa'
import { Float, Scribble } from '../shared.jsx'
import bulb from '../../assets/icons/electrical.webp'
import drop from '../../assets/icons/water.webp'
import broom from '../../assets/icons/cleaning.webp'
import brush from '../../assets/icons/painting.webp'
import heroPoster from '../../assets/media/hero-poster.jpg'
import heroWebm from '../../assets/media/hero.webm'
import heroMp4 from '../../assets/media/hero.mp4'

const services = ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Carpentry', 'Appliance Repair', 'HVAC', 'Landscaping']

const trust = [
  { icon: <MdVerifiedUser />, label: ['Verified', 'Professionals'] },
  { icon: <FaDollarSign />, label: ['Transparent', 'Pricing'] },
  { icon: <FaStar />, label: ['Real', 'Reviews'] },
  { icon: <FaRegCalendarCheck />, label: ['Easy', 'Booking'] },
]

const chips = [
  { icon: bulb, label: 'Electrical', className: 'chip-1', delay: 0 },
  { icon: drop, label: 'Plumbing', className: 'chip-2', delay: 0.6 },
  { icon: broom, label: 'Cleaning', className: 'chip-3', delay: 1.2 },
  { icon: brush, label: 'Painting', className: 'chip-4', delay: 1.8 },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Background video */}
      <motion.div
        className="hero-media"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      >
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={heroPoster}
          aria-hidden="true"
        >
          <source src={heroWebm} type="video/webm" />
          <source src={heroMp4} type="video/mp4" />
        </video>
      </motion.div>
      <div className="hero-fade" aria-hidden="true" />

      <div className="container-xl position-relative">
        <div className="row">
          <motion.div className="col-lg-6 col-xl-5 hero-copy" variants={stagger} initial="hidden" animate="show">
            <motion.p variants={item} className="eyebrow">Local help. Real experts.</motion.p>
            <motion.h1 variants={item} className="hero-title">
              Home Services
              <span className="d-block text-orange">
                Made Simple<span className="text-navy">.</span>
              </span>
            </motion.h1>
            <motion.p variants={item} className="hero-sub">
              Find trusted local professionals for all your home needs — quick, easy, and hassle-free.
            </motion.p>

            {/* TODO (Yashkumar): hook this search up to the services API. */}
            <motion.form variants={item} className="search-card" onSubmit={(e) => e.preventDefault()} role="search">
              <label className="search-field">
                <FiMapPin className="text-orange" />
                <select defaultValue="Windsor, ON" aria-label="Location">
                  <option>Windsor, ON</option>
                  <option>LaSalle, ON</option>
                  <option>Tecumseh, ON</option>
                  <option>Amherstburg, ON</option>
                </select>
                <FiChevronDown className="chev" />
              </label>
              <label className="search-field">
                <FiGrid className="opacity-75" />
                <select defaultValue="" aria-label="Service">
                  <option value="" disabled>Select a service</option>
                  {services.map((s) => <option key={s}>{s}</option>)}
                </select>
                <FiChevronDown className="chev" />
              </label>
              <motion.button
                type="submit"
                className="btn btn-orange search-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <FiSearch /> Search
              </motion.button>
            </motion.form>

            <motion.ul variants={item} className="trust-row list-unstyled">
              {trust.map((t) => (
                <li key={t.label[0]}>
                  <span className="trust-icon">{t.icon}</span>
                  <span className="trust-label">{t.label[0]}<br />{t.label[1]}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>

      {/* Floating service chips */}
      <div className="hero-chips d-none d-lg-block" aria-hidden="true">
        {chips.map((c) => (
          <motion.div
            key={c.label}
            className={`chip-wrap ${c.className}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 + c.delay / 3 }}
          >
            <Float delay={c.delay} distance={8} duration={4.2}>
              <div className="service-chip">
                <img src={c.icon} alt="" width="34" height="34" />
                <span>{c.label}</span>
              </div>
            </Float>
          </motion.div>
        ))}
        <Scribble className="hero-scribble" lines={['Skilled Professionals', 'for a Better Home']} arrow="down-right" delay={1.4} />
      </div>

      <svg className="wave wave-bottom" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 60 C 240 10, 480 10, 720 45 S 1200 90, 1440 30 V90 H0 Z" fill="#FFFFFF" />
      </svg>
    </section>
  )
}
