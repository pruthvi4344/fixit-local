import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { Reveal, Scribble } from '../shared.jsx'
import street from '../../assets/ref-street.jpg'

export default function CallToAction() {
  return (
    <section id="contact" className="cta">
      <motion.div
        className="cta-bg"
        style={{ backgroundImage: `url(${street})` }}
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        aria-hidden="true"
      />
      <div className="cta-fade" aria-hidden="true" />
      <div className="container-xl position-relative">
        <Reveal from="left" className="cta-card">
          <h2>Ready to Get Started?</h2>
          <p>Find trusted local professionals and make your home a better place.</p>
          <div className="d-flex flex-wrap gap-2">
            <motion.a href="#services" className="btn btn-orange btn-lg-pad" whileHover={{ x: 4 }}>
              Find a Provider <FiArrowRight />
            </motion.a>
            <motion.a href="#providers" className="btn btn-outline-dark-soft btn-lg-pad" whileHover={{ y: -2 }}>
              Become a Provider
            </motion.a>
          </div>
        </Reveal>
        <Scribble className="cta-scribble d-none d-md-block" lines={['Better Homes', 'Happier Communities']} arrow="down-right" />
      </div>
    </section>
  )
}
