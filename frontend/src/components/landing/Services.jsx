import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { Reveal, SectionTitle } from '../shared.jsx'
import plumbing from '../../assets/icons/plumbing.webp'
import electrical from '../../assets/icons/electrical.webp'
import cleaning from '../../assets/icons/cleaning.webp'
import painting from '../../assets/icons/painting.webp'
import carpentry from '../../assets/icons/carpentry.webp'
import appliance from '../../assets/icons/appliance.webp'
import hvac from '../../assets/icons/hvac.webp'
import landscaping from '../../assets/icons/landscaping.webp'
import handyman from '../../assets/icons/handyman.webp'
import moving from '../../assets/icons/moving.webp'

export const serviceList = [
  { name: 'Plumbing', icon: plumbing },
  { name: 'Electrical', icon: electrical },
  { name: 'Cleaning', icon: cleaning },
  { name: 'Painting', icon: painting },
  { name: 'Carpentry', icon: carpentry },
  { name: 'Appliance Repair', icon: appliance },
  { name: 'HVAC', icon: hvac },
  { name: 'Landscaping', icon: landscaping },
  { name: 'Handyman', icon: handyman },
  { name: 'Moving Help', icon: moving },
]

export default function Services() {
  const track = useRef(null)

  const scroll = (dir) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('.service-card')
    const step = card ? card.offsetWidth + 16 : 200
    el.scrollBy({ left: dir * step * 2, behavior: 'smooth' })
  }

  return (
    <section id="services" className="section services">
      <div className="container-xl">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <SectionTitle
            eyebrow="Our Services"
            sub="From quick fixes to major maintenance, find trusted professionals for a wide range of home services."
          >
            Everything Your Home Needs
          </SectionTitle>
          <Reveal from="right">
            <a href="#services" className="link-arrow">
              View All Services <FiArrowRight />
            </a>
          </Reveal>
        </div>

        <div className="carousel-shell">
          <button className="round-btn round-btn-outline carousel-prev" onClick={() => scroll(-1)} aria-label="Previous services">
            <FiArrowLeft />
          </button>
          <div className="service-track" ref={track}>
            {serviceList.map((s, i) => (
              <motion.a
                href="#services"
                key={s.name}
                className="service-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -8 }}
              >
                <motion.img
                  src={s.icon}
                  alt=""
                  width="64"
                  height="64"
                  whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <span>{s.name}</span>
              </motion.a>
            ))}
          </div>
          <button className="round-btn round-btn-outline carousel-next" onClick={() => scroll(1)} aria-label="Next services">
            <FiArrowRight />
          </button>
        </div>
      </div>
    </section>
  )
}
