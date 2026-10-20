import axios from 'axios'

// Sends the Django session cookie and CSRF token with every request.
const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

export default client
