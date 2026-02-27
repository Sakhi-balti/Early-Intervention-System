import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRiskScores } from '../api/otherAPIs'
import { getAttendance } from '../api/attendanceAPI'
import { getGrades } from '../api/otherAPIs'
import Sidebar from '../components/common/Sidebar'
import RiskBadge from '../components/common/RiskBadge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [risk,       setRisk]       = useState(null)
  const [attendance, setAttendance] = useState([])
  const [grades,     setGrades]     = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRiskScores(user.id),
      getAttendance(user.id),
      getGrades(user.id),
    ]).then(([r, a, g]) => {
      setRisk(r.data[0] || null)
      setAttendance(a.data)
      setGrades(g.data)
    }).finally(() => setLoading(false))
  }, [user])

  const attendancePct = attendance.length
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : 100
  const gradeAvg = grades.length
    ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
    : 0

  // Chart data from last 7 attendance records
  const chartData = attendance.slice(0, 7).reverse().map(a => ({
    date: a.date?.slice(5),
    value: a.status === 'present' ? 1 : 0,
  }))

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b' }}>Loading your dashboard...</div>
      </main>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            Welcome, {user?.username} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            {user?.department} · Your risk profile is updated in real-time
          </p>
        </div>

        {/* Risk score card */}
        {risk && (
          <div style={{
            background: risk.category === 'high' ? 'rgba(239,68,68,0.1)' : risk.category === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
            border: risk.category === 'high' ? '1px solid rgba(239,68,68,0.3)' : risk.category === 'medium' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(16,185,129,0.3)',
            borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px',
          }}>
            <div style={{ fontSize: '48px' }}>
              {risk.category === 'high' ? '🔴' : risk.category === 'medium' ? '🟡' : '🟢'}
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Your Risk Score
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '36px', fontWeight: '800', lineHeight: 1 }}>
                {risk.score}
              </div>
              <RiskBadge category={risk.category} />
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '11px' }}>Last updated</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                {new Date(risk.calculated_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {!risk && (
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px', marginBottom: '24px', color: '#64748b', textAlign: 'center' }}>
            No risk data yet. Risk score will appear after attendance is marked.
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Attendance Rate', value: `${attendancePct}%`, icon: '📋', color: attendancePct >= 75 ? '#10b981' : '#ef4444' },
            { label: 'Grade Average',   value: `${gradeAvg}%`,     icon: '📝', color: gradeAvg >= 60 ? '#10b981' : '#ef4444'  },
            { label: 'Total Records',   value: attendance.length,  icon: '📅', color: '#38bdf8' },
          ].map(s => (
            <div key={s.label} style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '28px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance chart */}
        {chartData.length > 0 && (
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '700', margin: '0 0 16px' }}>📈 Recent Attendance (1=Present, 0=Absent)</h3>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 1]} />
                <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '8px', color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent grades */}
        {grades.length > 0 && (
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d45' }}>
              <h3 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '700', margin: 0 }}>📝 Recent Grades</h3>
            </div>
            {grades.slice(0, 5).map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px',
                borderBottom: i < 4 ? '1px solid #1e2d45' : 'none', alignItems: 'center' }}>
                <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{g.subject} — {g.exam_type}</span>
                <span style={{ color: g.score >= 50 ? '#10b981' : '#ef4444', fontWeight: '700', fontSize: '14px' }}>
                  {g.score}/{g.total}
                </span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
