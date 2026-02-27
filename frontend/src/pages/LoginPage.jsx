import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login }   = useAuth()
  const navigate    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(form.username, form.password)
      // Redirect based on role
      const routes = { student: '/student', teacher: '/teacher', counselor: '/counselor', admin: '/admin' }
      navigate(routes[user.role] || '/student')
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0e1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#131929', border: '1px solid #1e2d45', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '400px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
          <h1 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: '800', margin: 0 }}>
            Early Intervention System
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            Islamia University of Bahawalpur
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#f87171',
            fontSize: '13px', marginBottom: '16px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text" required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e2d45',
                color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #1e2d45',
                color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            background: loading ? '#1e2d45' : '#0ea5e9', color: 'white',
            border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '20px' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
