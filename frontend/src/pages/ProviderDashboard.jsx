// Owner: Deep
import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Form } from 'react-bootstrap'
import client from '../api/client.js'
import FieldError from '../components/FieldError.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const emptyForm = {
  business_name: '',
  categories: [],
  service_area: '',
  years_experience: '',
  bio: '',
}

// The banner at the top changes with the verification status.
function StatusBanner({ profile }) {
  if (profile.status === 'incomplete') {
    return <Alert variant="warning">Complete your profile to get verified.</Alert>
  }
  if (profile.status === 'pending') {
    return <Alert variant="info"><Badge bg="info" className="me-2">Pending</Badge>Thanks! An admin is reviewing your details.</Alert>
  }
  if (profile.status === 'verified') {
    return <Alert variant="success"><Badge bg="success" className="me-2">Verified</Badge>You now appear in search and customers can find you.</Alert>
  }
  return (
    <Alert variant="danger">
      <Badge bg="danger" className="me-2">Rejected</Badge>
      <strong>Reason:</strong> {profile.rejection_reason}
      <div className="mt-1">Please fix this below and submit again.</div>
    </Alert>
  )
}

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [allCategories, setAllCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)
  const [idDocument, setIdDocument] = useState(null)
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([client.get('/accounts/provider/profile/'), client.get('/services/categories/')])
      .then(([profileRes, categoriesRes]) => {
        const data = profileRes.data
        setProfile(data)
        setAllCategories(categoriesRes.data)
        // After a rejection the form opens with what they sent last time.
        setForm({
          business_name: data.business_name,
          categories: data.categories,
          service_area: data.service_area,
          years_experience: data.years_experience ?? '',
          bio: data.bio,
        })
      })
      .catch(() => setLoadError('Could not load your dashboard, please refresh the page.'))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleCategory = (id) => {
    const picked = form.categories.includes(id)
    setForm({
      ...form,
      categories: picked ? form.categories.filter((c) => c !== id) : [...form.categories, id],
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    // FormData is needed because we are sending files.
    const data = new FormData()
    data.append('business_name', form.business_name)
    data.append('service_area', form.service_area)
    data.append('years_experience', form.years_experience)
    data.append('bio', form.bio)
    form.categories.forEach((id) => data.append('categories', id))
    if (photo) data.append('photo', photo)
    if (idDocument) data.append('id_document', idDocument)

    client
      .post('/accounts/provider/profile/', data)
      .then((res) => {
        setProfile(res.data)
        window.scrollTo(0, 0)
      })
      .catch((err) => setErrors(err.response?.data ?? { detail: 'Something went wrong, please try again.' }))
      .finally(() => setSaving(false))
  }

  if (loadError) return <Alert variant="danger">{loadError}</Alert>
  if (!profile) return <p>Loading...</p>

  const canSubmit = profile.status === 'incomplete' || profile.status === 'rejected'

  return (
    <div>
      <h1>Provider dashboard</h1>
      <p className="text-muted">Welcome, {user.name}</p>

      <StatusBanner profile={profile} />

      {canSubmit && (
        <Form onSubmit={handleSubmit} className="form-card">
          <h2 className="h4 mb-3">Verification form</h2>
          {errors.detail && <Alert variant="danger">{errors.detail}</Alert>}

          <Form.Group className="mb-3" controlId="business_name">
            <Form.Label>Business name</Form.Label>
            <Form.Control name="business_name" value={form.business_name} onChange={handleChange} required />
            <FieldError errors={errors} name="business_name" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Service categories</Form.Label>
            <div className="category-checks">
              {allCategories.map((category) => (
                <Form.Check
                  key={category.id}
                  id={`category-${category.id}`}
                  label={category.name}
                  checked={form.categories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
              ))}
            </div>
            <FieldError errors={errors} name="categories" />
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-8 mb-3" controlId="service_area">
              <Form.Label>Service area</Form.Label>
              <Form.Control name="service_area" placeholder="Windsor, LaSalle" value={form.service_area} onChange={handleChange} required />
              <FieldError errors={errors} name="service_area" />
            </Form.Group>

            <Form.Group className="col-md-4 mb-3" controlId="years_experience">
              <Form.Label>Years of experience</Form.Label>
              <Form.Control type="number" min="0" max="70" name="years_experience" value={form.years_experience} onChange={handleChange} required />
              <FieldError errors={errors} name="years_experience" />
            </Form.Group>
          </div>

          <Form.Group className="mb-3" controlId="bio">
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={4} name="bio" value={form.bio} onChange={handleChange} required />
            <FieldError errors={errors} name="bio" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="photo">
            <Form.Label>Profile photo</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0] ?? null)} />
            {profile.photo && <Form.Text>You already uploaded a photo. Choose a new one only to replace it.</Form.Text>}
            <FieldError errors={errors} name="photo" />
          </Form.Group>

          <Form.Group className="mb-4" controlId="id_document">
            <Form.Label>ID or licence document (PDF, JPG or PNG, up to 5 MB)</Form.Label>
            <Form.Control type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setIdDocument(e.target.files[0] ?? null)} />
            {profile.has_id_document && <Form.Text>You already uploaded a document. Choose a new one only to replace it.</Form.Text>}
            <FieldError errors={errors} name="id_document" />
          </Form.Group>

          <Button type="submit" className="btn-orange px-4 py-2" disabled={saving}>
            {saving ? 'Submitting...' : 'Submit for verification'}
          </Button>
        </Form>
      )}
    </div>
  )
}
