// Owner: Deep & Haris
import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Table } from 'react-bootstrap'
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

const emptyServiceForm = {
  title: '',
  category: '',
  price: '',
  description: '',
}

// The banner at the top changes with the verification status.
function StatusBanner({ profile }) {
  if (profile.status === 'incomplete') {
    return <Alert variant="warning"><Badge bg="warning" text="dark" className="me-2">Not submitted</Badge>Complete your profile to get verified.</Alert>
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

  // Haris Task: Services State
  const [services, setServices] = useState([])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [serviceForm, setServiceForm] = useState(emptyServiceForm)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [serviceErrors, setServiceErrors] = useState({})
  const [savingService, setSavingService] = useState(false)

  const fetchServices = () => {
    client.get('/services/my-services/')
      .then((res) => setServices(res.data))
      .catch((err) => console.error('Could not load services', err))
  }

  useEffect(() => {
    Promise.all([
      client.get('/accounts/provider/profile/'),
      client.get('/services/categories/'),
      client.get('/services/my-services/').catch(() => ({ data: [] }))
    ])
      .then(([profileRes, categoriesRes, servicesRes]) => {
        const data = profileRes.data
        setProfile(data)
        setAllCategories(categoriesRes.data)
        setServices(servicesRes.data)
        setForm({
          business_name: data.business_name || '',
          categories: data.categories || [],
          service_area: data.service_area || '',
          years_experience: data.years_experience ?? '',
          bio: data.bio || '',
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

  // Haris Task: Manage Service CRUD Operations
  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingServiceId(service.id)
      setServiceForm({
        title: service.title,
        category: service.category,
        price: service.price,
        description: service.description || '',
      })
    } else {
      setEditingServiceId(null)
      setServiceForm(emptyServiceForm)
    }
    setServiceErrors({})
    setShowServiceModal(true)
  }

  const handleCloseModal = () => {
    setShowServiceModal(false)
    setEditingServiceId(null)
    setServiceForm(emptyServiceForm)
  }

  const handleServiceChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value })
  }

  const handleServiceSubmit = (e) => {
    e.preventDefault()
    setSavingService(true)
    setServiceErrors({})

    const request = editingServiceId
      ? client.put(`/services/my-services/${editingServiceId}/`, serviceForm)
      : client.post('/services/my-services/', serviceForm)

    request
      .then(() => {
        fetchServices()
        handleCloseModal()
      })
      .catch((err) => setServiceErrors(err.response?.data ?? { detail: 'Failed to save service.' }))
      .finally(() => setSavingService(false))
  }

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      client
        .delete(`/services/my-services/${id}/`)
        .then(() => fetchServices())
        .catch((err) => alert('Could not delete service.'))
    }
  }

  if (loadError) return <Alert variant="danger">{loadError}</Alert>
  if (!profile) return <p>Loading...</p>

  const canSubmit = profile.status === 'incomplete' || profile.status === 'rejected'

  return (
    <div className="container py-4">
      <h1>Provider dashboard</h1>
      <p className="text-muted">Welcome, {user.name}</p>

      <StatusBanner profile={profile} />

      {/* Haris Task: Services Management Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
          <h2 className="h5 mb-0 font-weight-bold">Manage Your Services</h2>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            + Add New Service
          </Button>
        </Card.Header>
        <Card.Body>
          {services.length === 0 ? (
            <p className="text-muted mb-0">No services added yet. Click "+ Add New Service" to list what you offer.</p>
          ) : (
            <Table responsive striped hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <strong>{service.title}</strong>
                      {service.description && <div className="text-muted small">{service.description}</div>}
                    </td>
                    <td>
                      {allCategories.find((c) => c.id === service.category)?.name || service.category_name || 'Category'}
                    </td>
                    <td>${service.price}</td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenModal(service)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteService(service.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Verification Form Section */}
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

      {/* Modal for Creating / Editing Service */}
      <Modal show={showServiceModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleServiceSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingServiceId ? 'Edit Service' : 'Add New Service'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {serviceErrors.detail && <Alert variant="danger">{serviceErrors.detail}</Alert>}

            <Form.Group className="mb-3" controlId="service_title">
              <Form.Label>Service Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="e.g. Sink Leak Repair"
                value={serviceForm.title}
                onChange={handleServiceChange}
                required
              />
              <FieldError errors={serviceErrors} name="title" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="service_category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={serviceForm.category}
                onChange={handleServiceChange}
                required
              >
                <option value="">Select a category...</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
              <FieldError errors={serviceErrors} name="category" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="service_price">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                placeholder="e.g. 75.00"
                value={serviceForm.price}
                onChange={handleServiceChange}
                required
              />
              <FieldError errors={serviceErrors} name="price" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="service_description">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Describe what's included in this service..."
                value={serviceForm.description}
                onChange={handleServiceChange}
              />
              <FieldError errors={serviceErrors} name="description" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="orange" className="btn-orange" type="submit" disabled={savingService}>
              {savingService ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}