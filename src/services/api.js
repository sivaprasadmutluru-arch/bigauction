import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

// Attach JWT token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap response data; normalise errors to Error objects so err.message always works
api.interceptors.response.use(
  res => res.data,
  err => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return new Promise(() => {})  // navigation is underway; never settle this promise
    }
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Request failed'
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
  },
)

export function uploadImage(file) {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data)
}

export default api
