import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { FaRegCalendarCheck } from 'react-icons/fa'
import { Reveal, SectionTitle, Float, Scribble } from '../shared.jsx'
import proTablet from '../../assets/ref-pro-tablet.jpg'

const MotionLink = motion.create(Link)

const perks = [
  'Create your professional profile',
  'Showcase your services and pricing',
  'Manage bookings and availability',
  'Build your reputation with reviews',
  'Get more local customers',
]

function Toggle({ label, initial = true }) {
  const [on, setOn] = useState(initial)
  return (
    <button type="button" className="toggle-row" onClick={() => setOn(!on)} aria-pressed={on}>
      <span>{label}</span>
      <span className={`switch ${on ? 'on' : ''}`}>
        <motion.span className="knob" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </span>
    </button>
  )
}

export default function Providers() {
  return (
    <section id="providers" className="section providers split">
      <div className="container-xl">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-5">
            <SectionTitle
              eyebrow="For Service Providers"
              sub="Join our platform and connect with real customers in your area."
            >
              Grow Your Business <br />
              with <span className="text-orange">FixIt Local</span>
            </SectionTitle>

            <ul className="check-list list-unstyled">
              {perks.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                >
                  <span className="check"><FiCheck /></span>
                  {p}
                </motion.li>
              ))}
            </ul>

            <Reveal delay={0.4}>
              <MotionLink to="/signup" className="btn btn-orange btn-lg-pad" whileHover={{ x: 4 }}>
                Become a Provider <FiArrowRight />
              </MotionLink>
            </Reveal>
          </div>

          <div className="col-lg-7">
            <Reveal from="right" className="art art-tablet">
              <img src={proTablet} alt="Service provider managing bookings on a tablet" loading="lazy" />

              <Float className="card-new-booking" distance={8} duration={4.5}>
                <span className="nb-icon"><FaRegCalendarCheck /></span>
                <div>
                  <strong>New Booking</strong>
                  <small className="d-block">Kitchen Repair</small>
                  <small className="d-block text-muted">Today, 2:00 PM</small>
                </div>
              </Float>

              <Float className="card-manage" distance={8} duration={5} delay={0.8}>
                <strong className="d-block mb-1">Manage Services</strong>
                <Toggle label="Plumbing" />
                <Toggle label="Electrical" />
                <Toggle label="Painting" />
              </Float>

              <div className="growth" aria-hidden="true">
                <div className="bars">
                  {[30, 45, 60, 80].map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.6 + i * 0.15 }}
                    />
                  ))}
                </div>
                <Scribble lines={['More', 'Customers', 'More Opportunities']} arrow="up-left" className="growth-note" delay={0.5} />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
