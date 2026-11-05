// Shows the error Django sent back for one form field.
// `errors` looks like { email: ['An account with this email already exists.'] }
export default function FieldError({ errors, name }) {
  if (!errors[name]) return null
  return <div className="text-danger small mt-1">{errors[name].join(' ')}</div>
}
