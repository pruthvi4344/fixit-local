import plumbing from '../assets/icons/plumbing.webp'
import electrical from '../assets/icons/electrical.webp'
import cleaning from '../assets/icons/cleaning.webp'
import painting from '../assets/icons/painting.webp'
import carpentry from '../assets/icons/carpentry.webp'
import appliance from '../assets/icons/appliance.webp'
import hvac from '../assets/icons/hvac.webp'
import landscaping from '../assets/icons/landscaping.webp'
import handyman from '../assets/icons/handyman.webp'
import moving from '../assets/icons/moving.webp'
import pest from '../assets/icons/pest.webp'

const icons = {
  Plumbing: plumbing,
  Electrical: electrical,
  Cleaning: cleaning,
  Painting: painting,
  Carpentry: carpentry,
  'Appliance Repair': appliance,
  HVAC: hvac,
  Landscaping: landscaping,
  Handyman: handyman,
  'Moving Help': moving,
  'Pest Control': pest,
}

// A new category added in the admin panel falls back to the handyman icon.
export function categoryIcon(name) {
  return icons[name] ?? handyman
}

// Django sends prices as text like "85.00". This shows $85, $89.50 or $1,400.
export function formatPrice(price) {
  const amount = Number(price)
  const cents = Number.isInteger(amount) ? 0 : 2
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: cents, maximumFractionDigits: 2 })}`
}
