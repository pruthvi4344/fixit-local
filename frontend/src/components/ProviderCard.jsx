import { Card, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function ProviderCard({ provider }) {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>
          {provider.name}{' '}
          {provider.is_verified && <Badge bg="success">Verified</Badge>}
        </Card.Title>
        <Card.Text>{provider.bio}</Card.Text>
        <Link to={`/providers/${provider.id}`}>View profile</Link>
      </Card.Body>
    </Card>
  )
}
