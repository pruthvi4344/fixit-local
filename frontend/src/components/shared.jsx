import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ---------- Brand logo ---------- */
export function Logo({ light = false, size = 34 }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="FixIt Local home">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 22 24 7l18 15" fill="none" stroke="#F26B1D" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33 13V8h5v9.5" fill="none" stroke="#F26B1D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22v19h28V22" fill="none" stroke={light ? '#fff' : '#14213D'} strokeWidth="4" strokeLinejoin="round" />
        <path d="M18 34l9-9" stroke="#F26B1D" strokeWidth="4" strokeLinecap="round" />
        <circle cx="29" cy="23" r="4" fill="none" stroke="#F26B1D" strokeWidth="3.5" />
      </svg>
      <span className="logo-text">
        FixIt <span className="text-orange">Local</span>
      </span>
    </Link>
  )
}

/* ---------- Scroll-reveal wrapper ---------- */
const variants = {
  up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 50 }, show: { opacity: 1, x: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } },
}

export function Reveal({ children, from = 'up', delay = 0, className = '', as = 'div', ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      variants={variants[from]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ---------- Section heading (eyebrow + title + subtitle) ---------- */
export function SectionTitle({ eyebrow, children, sub, className = '' }) {
  return (
    <div className={className}>
      <Reveal as="p" className="eyebrow">{eyebrow}</Reveal>
      <Reveal as="h2" className="section-title" delay={0.08}>{children}</Reveal>
      {sub && <Reveal as="p" className="section-sub" delay={0.16}>{sub}</Reveal>}
    </div>
  )
}

/* ---------- Gentle floating animation ---------- */
export function Float({ children, className = '', delay = 0, distance = 10, duration = 4, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Handwritten note with curved arrow ---------- */
export function Scribble({ lines, className = '', arrow = 'down-left', delay = 0.6 }) {
  const paths = {
    'down-left': 'M70 4 C 60 30, 35 40, 8 44',
    'up-left': 'M70 44 C 60 18, 35 8, 8 6',
    'down-right': 'M8 4 C 20 30, 45 40, 70 44',
  }
  const heads = {
    'down-left': 'M17 38 L8 44 L18 49',
    'up-left': 'M17 1 L8 6 L17 13',
    'down-right': 'M61 38 L70 44 L60 49',
  }
  return (
    <Reveal className={`scribble ${className}`} from="zoom" delay={delay}>
      <span>
        {lines.map((l, i) => (
          <span key={i} className="d-block">{l}</span>
        ))}
      </span>
      <svg className={`scribble-arrow arrow-${arrow}`} width="78" height="50" viewBox="0 0 78 50" fill="none" aria-hidden="true">
        <motion.path
          d={paths[arrow]}
          stroke="#14213D"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        />
        <motion.path
          d={heads[arrow]}
          stroke="#14213D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2, delay: delay + 1.25 }}
        />
      </svg>
    </Reveal>
  )
}
