// Owner: Pruthviraj
import SectionCurves from '../components/landing/SectionCurves.jsx'
import Hero from '../components/landing/Hero.jsx'
import Services from '../components/landing/Services.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import Homeowners from '../components/landing/Homeowners.jsx'
import Providers from '../components/landing/Providers.jsx'
import Testimonials from '../components/landing/Testimonials.jsx'
import CallToAction from '../components/landing/CallToAction.jsx'

export default function Home() {
  return (
    <>
      <SectionCurves />
      <Hero />
      <Services />
      <HowItWorks />
      <Homeowners />
      <Providers />
      <Testimonials />
      <CallToAction />
    </>
  )
}
