import { motion } from 'framer-motion'
import { MdVerifiedUser } from 'react-icons/md'
import { FaCheckCircle, FaBalanceScale, FaRegCalendarCheck, FaHome, FaStar, FaUsers } from 'react-icons/fa'
import { Reveal, SectionTitle, Float } from '../shared.jsx'
import proWrench from '../../assets/ref-pro-wrench.jpg'

const features = [
  { icon: <MdVerifiedUser />, text: 'Verified & trusted professionals' },
  { icon: <FaHome />, text: 'Wide range of home services' },
  { icon: <FaBalanceScale />, text: 'Compare prices and reviews' },
  { icon: <FaStar />, text: 'Real customer reviews' },
  { icon: <FaRegCalendarCheck />, text: 'Easy and secure booking' },
  { icon: <FaUsers />, text: 'Support your local community' },
]

export default function Homeowners() {
  return (
    <section id="about" className="section homeowners split">
      <div className="container-xl">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6 order-2 order-lg-1">
            <Reveal from="left" className="art art-wrench">
              <img src={proWrench} alt="Plumber fixing a kitchen sink with a wrench" loading="lazy" />
              <Float className="badge-verified" distance={6} duration={3.5}>
                <FaCheckCircle className="text-success" /> Verified Professional
              </Float>
            </Reveal>
          </div>

          <div className="col-lg-6 order-1 order-lg-2">
            <SectionTitle
              eyebrow="For Homeowners"
              sub="Save time, get reliable help, and enjoy a hassle-free experience."
            >
              Find the Right <br />
              <span className="text-orange">Professional with Ease</span>
            </SectionTitle>

            <ul className="feature-grid list-unstyled">
              {features.map((f, i) => (
                <motion.li
                  key={f.text}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                >
                  <span className="feature-icon">{f.icon}</span>
                  {f.text}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
