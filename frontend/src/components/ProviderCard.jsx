import { Link } from 'react-router-dom'
import { FiArrowRight, FiBriefcase, FiMapPin } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import ProviderAvatar from './ProviderAvatar.jsx'
import { categoryIcon, formatPrice } from './providerHelpers.js'

// The whole card is one link to the provider's profile page.
export default function ProviderCard({ provider }) {
  return (
    <Link to={`/providers/${provider.id}`} className="provider-card">
      <div className="provider-card-top">
        <img className="provider-card-icon" src={categoryIcon(provider.categories[0])} alt="" width="68" height="68" />
        <div className="provider-card-avatar">
          <ProviderAvatar provider={provider} />
        </div>
      </div>

      <div className="provider-card-body">
        <h2 className="provider-card-name">{provider.name}</h2>
        {provider.is_verified && (
          <span className="verified-pill"><MdVerified /> Verified</span>
        )}

        <ul className="provider-meta list-unstyled">
          <li><FiMapPin /> {provider.service_area}</li>
          <li><FiBriefcase /> {provider.years_experience} years of experience</li>
        </ul>

        <p className="provider-card-bio">{provider.bio}</p>

        <div className="provider-card-footer">
          {provider.starting_price ? (
            <span className="provider-price"><small>From</small> {formatPrice(provider.starting_price)}</span>
          ) : (
            <span className="provider-price-empty">Prices coming soon</span>
          )}
          <span className="provider-card-link">View profile <FiArrowRight /></span>
        </div>
      </div>
    </Link>
  )
}
