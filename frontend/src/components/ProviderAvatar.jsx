const colors = ['#F26B1D', '#14213D', '#2E8B57', '#7B4DD8', '#D7263D', '#0E7C86']

// Shows the provider's photo, or their initials if they don't have one.
export default function ProviderAvatar({ provider, size = 72 }) {
  const style = { width: size, height: size, fontSize: size * 0.36 }

  if (provider.photo) {
    return <img className="provider-avatar" style={style} src={provider.photo} alt={provider.name} />
  }

  const initials = provider.name.split(' ').slice(0, 2).map((word) => word[0]).join('')
  return (
    <span
      className="provider-avatar"
      style={{ ...style, background: colors[provider.id % colors.length] }}
      role="img"
      aria-label={provider.name}
    >
      {initials}
    </span>
  )
}
