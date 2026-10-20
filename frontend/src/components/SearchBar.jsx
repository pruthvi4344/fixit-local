import { useState } from 'react'
import { Form, Button, InputGroup } from 'react-bootstrap'

// Keyword + category drop-down. Owner: Yashkumar
export default function SearchBar({ categories = [], onSearch }) {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.({ keyword, category })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.Control
          placeholder="What do you need fixed?"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Form.Select>
        <Button type="submit">Search</Button>
      </InputGroup>
    </Form>
  )
}
