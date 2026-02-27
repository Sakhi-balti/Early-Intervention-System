import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = {
  student:   [{ to: '/student',   label: '📊 My Dashboard' }],
  teacher:   [{ to: '/teacher',   label: '📋 Mark Attendance' },
              { to: '/grades',    label: '📝 Enter Grades' }],
  counselor: [{ to: '/counselor', label: '🔔 Alerts & Cases' }],
  admin:     [{ to: '/admin',     label: '🛡️ Admin Dashboard' },
              { to: '/risk/high', label: '⚠️ High Risk Students' }],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const navLinks = links[user?.role] || []

  return (
    <aside style={{
      width: '220px', minHeight: '100vh', background: '#0f172a',
      display: 'flex', flexDirection: 'column', padding: '24px 0',
      borderRight: '1px solid #1e293b', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ color: '#38bdf8', fontWeight: '800', fontSize: '15px' }}>
          🎯 EIS
        </div>
        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
          Early Intervention
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>
          {user?.username}
        </div>
        <div style={{
          color: '#38bdf8', fontSize: '10px', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '1px', marginTop: '3px'
        }}>
          {user?.role}
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'block', padding: '10px 12px', borderRadius: '8px',
            color: isActive ? '#38bdf8' : '#94a3b8',
            background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
            textDecoration: 'none', fontSize: '13px', fontWeight: '500',
            marginBottom: '4px', transition: 'all 0.2s',
          })}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0 12px' }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '10px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.1)', color: '#f87171',
          border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
          fontSize: '13px', fontWeight: '600',
        }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
