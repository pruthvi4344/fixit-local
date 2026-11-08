import { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import client from '../api/client.js'
import FieldError from '../components/FieldError.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
    const { user, setUser } = useAuth()
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
    })
    const [photo, setPhoto] = useState(null)
    const [success, setSuccess] = useState('')
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        client.get('/accounts/me/')
            .then((res) => {
                const data = res.data
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    phone_number: data.phone_number || '',
                })
            })
            .catch((err) => console.error('Failed to load profile details:', err))
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSaving(true)
        setErrors({})
        setSuccess('')

        const data = new FormData()
        data.append('first_name', formData.first_name)
        data.append('last_name', formData.last_name)
        data.append('phone_number', formData.phone_number)
        if (photo) {
            data.append('photo', photo)
        }

        client.patch('/accounts/me/', data)
            .then((res) => {
                setSuccess('Profile updated successfully!')
                if (setUser) setUser(res.data)
            })
            .catch((err) => setErrors(err.response?.data ?? { detail: 'Could not update profile.' }))
            .finally(() => setSaving(false))
    }

    return (
        <div className="container py-4" style={{ maxWidth: '600px' }}>
            <h2>Edit Profile</h2>
            {success && <Alert variant="success">{success}</Alert>}
            {errors.detail && <Alert variant="danger">{errors.detail}</Alert>}

            <Form onSubmit={handleSubmit} className="form-card mt-3">
                <Form.Group className="mb-3" controlId="first_name">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    <FieldError errors={errors} name="first_name" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="last_name">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                    <FieldError errors={errors} name="last_name" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="phone_number">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="tel"
                        name="phone_number"
                        placeholder="e.g. +1 519 555 0199"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                    <FieldError errors={errors} name="phone_number" />
                </Form.Group>

                <Form.Group className="mb-4" controlId="photo">
                    <Form.Label>Profile Photo</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0] ?? null)}
                    />
                    <FieldError errors={errors} name="photo" />
                </Form.Group>

                <Button type="submit" className="btn-orange w-100" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
            </Form>
        </div>
    )
}