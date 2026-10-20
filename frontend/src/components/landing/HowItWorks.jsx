import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import { FaRegCalendarAlt, FaHardHat } from 'react-icons/fa'
import { Reveal, SectionTitle, Float } from '../shared.jsx'
import homeowner from '../../assets/ref-homeowner.jpg'

const steps = [
  { n: 1, icon: <FiSearch />, title: 'Search & Compare', text: 'Find verified service providers in your area.' },
  { n: 2, icon: <FaRegCalendarAlt />, title: 'Book a Time Slot', text: 'Choose a convenient date and time.' },
  { n: 3, icon: <FaHardHat />, title: 'Get the Job Done', text: 'Relax while the professional completes your service.' },
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dates = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

function MiniCalendar() {
  const [picked, setPicked] = useState(13)
  const [done, setDone] = useState(false)
  return (
    <div className="booking-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>Book a Service</strong>
        <FiChevronDown className="opacity-50" />
      </div>
      <div className="cal-grid">
        {days.map((d) => <span key={d} className="cal-head">{d}</span>)}
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            className={`cal-day ${picked === d ? 'picked' : ''}`}
            onClick={() => { setPicked(d); setDone(false) }}
            aria-label={`Pick day ${d}`}
          >
            {d}
          </button>
        ))}
      </div>
      <motion.button
        type="button"
        className="btn btn-orange w-100 mt-2 btn-xs"
        whileTap={{ scale: 0.95 }}
        onClick={() => setDone(true)}
      >
        {done ? 'Booking Confirmed ✓' : 'Confirm Booking'}
      </motion.button>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section how split">
      <div className="container-xl">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-7">
            <SectionTitle eyebrow="How It Works" sub="A seamless booking experience from start to finish.">
              Get Your Job Done <br className="d-none d-md-block" />
              in <span className="text-orange">3 Simple Steps</span>
            </SectionTitle>

            <div className="steps">
              {/* dashed connectors */}
              <svg className="steps-arrows d-none d-md-block" viewBox="0 0 600 70" preserveAspectRatio="none" aria-hidden="true">
                {[[70, 225], [270, 425]].map(([a, b], i) => (
                  <motion.g
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 + i * 0.4 }}
                  >
                    <path
                      d={`M${a} 58 C ${a + 30} 6, ${b - 40} 6, ${b} 52`}
                      fill="none"
                      stroke="#F26B1D"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      className="dash-flow"
                    />
                    <path d={`M${b - 9} 46 L${b} 53 L${b + 3} 42`} fill="none" stroke="#F26B1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.g>
                ))}
              </svg>
              <div className="row g-3">
                {steps.map((s, i) => (
                  <div className="col-md-4" key={s.n}>
                    <Reveal delay={0.15 * i} className="step-card">
                      <motion.span
                        className="step-num"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.3 + 0.15 * i }}
                      >
                        {s.n}
                      </motion.span>
                      <div className="d-flex gap-3 align-items-start">
                        <span className="step-icon">{s.icon}</span>
                        <div>
                          <h3>{s.title}</h3>
                          <p>{s.text}</p>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <Reveal from="right" className="art art-how">
              <img src={homeowner} alt="Homeowner booking a service on her phone" loading="lazy" />
              <Float className="float-booking" distance={10} duration={5}>
                <MiniCalendar />
              </Float>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
