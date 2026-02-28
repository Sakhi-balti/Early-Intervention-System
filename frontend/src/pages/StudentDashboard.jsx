import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRiskScores } from '../api/otherAPIs'
import { getAttendance } from '../api/attendanceAPI'
import { getGrades } from '../api/otherAPIs'
import Sidebar from '../components/common/Sidebar'
import RiskBadge from '../components/common/RiskBadge'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,23,42,0.97)', border: '1px solid #1e2d45',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {label && <p style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#e2e8f0', fontSize: '13px', fontWeight: '700', margin: '2px 0' }}>
          {p.name}: <span style={{ color: '#fff' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function StudentDashboard() {
  const { user }  = useAuth()
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

  const presentCount  = attendance.filter(a => a.status === 'present').length
  const absentCount   = attendance.filter(a => a.status === 'absent').length
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 100
  const gradeAvg      = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 0
  const passingGrades = grades.filter(g => (g.score / g.total) >= 0.5).length
  const failingGrades = grades.length - passingGrades

  const attendancePieData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent',  value: absentCount  },
  ].filter(d => d.value > 0)

  const gradesPieData = [
    { name: 'Passing', value: passingGrades },
    { name: 'Failing', value: failingGrades },
  ].filter(d => d.value > 0)

  const gradesBarData = grades.slice(0, 8).map(g => ({
    name:  g.subject?.slice(0, 8) || 'Subject',
    score: parseFloat(((g.score / g.total) * 100).toFixed(1)),
  }))

  const attendanceTrend = attendance.slice(0, 10).reverse().map((a, i) => ({
    day:     a.date?.slice(5) || `D${i}`,
    present: a.status === 'present' ? 1 : 0,
  }))

  const riskColor = risk?.category === 'high' ? '#ef4444' : risk?.category === 'medium' ? '#f59e0b' : '#10b981'
  const riskGlow  = risk?.category === 'high'
    ? '0 0 30px rgba(239,68,68,0.35)'
    : risk?.category === 'medium'
    ? '0 0 30px rgba(245,158,11,0.25)'
    : '0 0 30px rgba(16,185,129,0.25)'

  const ATTEND_COLORS = ['#10b981', '#ef4444']
  const GRADE_COLORS  = ['#38bdf8', '#f59e0b']

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
          <h1 style={{ color: '#e2e8f0', fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', textShadow: '0 0 30px rgba(56,189,248,0.2)' }}>
            Welcome back, {user?.username} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            {user?.department} · Your performance is updated in real-time
          </p>
        </div>

        {/* Risk Hero Card */}
        <div style={{
          background: `linear-gradient(135deg, ${riskColor}12 0%, #0f172a 70%)`,
          border: `1px solid ${riskColor}44`, borderRadius: '16px',
          padding: '28px', marginBottom: '24px', boxShadow: riskGlow,
          display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flexShrink: 0 }}>
            <ResponsiveContainer width={110} height={110}>
              <RadialBarChart cx={55} cy={55} innerRadius={32} outerRadius={50}
                data={[{ value: risk?.score || 0, fill: riskColor }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#1e2d45' }}/>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
              Risk Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
              <span style={{ color: riskColor, fontSize: '52px', fontWeight: '900', lineHeight: 1, textShadow: `0 0 24px ${riskColor}77` }}>
                {risk?.score?.toFixed(0) || '—'}
              </span>
              {risk && <RiskBadge category={risk.category} />}
            </div>
            <div style={{ color: '#475569', fontSize: '12px' }}>
              {risk ? `Updated ${new Date(risk.calculated_at).toLocaleString()}` : 'Mark attendance to generate score'}
            </div>
          </div>
          {risk && (
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              {[
                { label: 'Attendance', value: `${risk.attendance_pct?.toFixed(0)}%`, color: '#38bdf8' },
                { label: 'Grade Avg',  value: `${risk.grade_avg?.toFixed(0)}`,       color: '#10b981' },
                { label: 'Incidents',  value: risk.incidents,                         color: '#f59e0b' },
              ].map(f => (
                <div key={f.label} style={{
                  textAlign: 'center', background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px', padding: '12px 16px',
                  border: `1px solid ${f.color}22`,
                }}>
                  <div style={{ color: f.color, fontSize: '20px', fontWeight: '800', textShadow: `0 0 12px ${f.color}77` }}>{f.value}</div>
                  <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>{f.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Attendance Pie */}
          <div style={{ background: 'linear-gradient(145deg, #131929, #0d1520)', border: '1px solid #1e2d45', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '700', margin: '0 0 2px', textShadow: '0 0 10px rgba(56,189,248,0.2)' }}>📋 Attendance</h3>
            <p style={{ color: '#475569', fontSize: '10px', margin: '0 0 10px' }}>{attendance.length} total records</p>
            {attendancePieData.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', padding: '30px 0', fontSize: '12px' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={attendancePieData} cx="50%" cy="45%" outerRadius={65} innerRadius={32}
                    dataKey="value" strokeWidth={2} stroke="#0a0e1a">
                    {attendancePieData.map((_, i) => (
                      <Cell key={i} fill={ATTEND_COLORS[i]} style={{ filter: `drop-shadow(0 0 6px ${ATTEND_COLORS[i]}99)` }}/>
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend iconSize={8} iconType="circle" formatter={v => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Grades Pie */}
          <div style={{ background: 'linear-gradient(145deg, #131929, #0d1520)', border: '1px solid #1e2d45', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '700', margin: '0 0 2px', textShadow: '0 0 10px rgba(16,185,129,0.2)' }}>📝 Grade Results</h3>
            <p style={{ color: '#475569', fontSize: '10px', margin: '0 0 10px' }}>{grades.length} assessments</p>
            {gradesPieData.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', padding: '30px 0', fontSize: '12px' }}>No grades yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={gradesPieData} cx="50%" cy="45%" outerRadius={65} innerRadius={32}
                    dataKey="value" strokeWidth={2} stroke="#0a0e1a">
                    {gradesPieData.map((_, i) => (
                      <Cell key={i} fill={GRADE_COLORS[i]} style={{ filter: `drop-shadow(0 0 6px ${GRADE_COLORS[i]}99)` }}/>
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend iconSize={8} iconType="circle" formatter={v => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Stats */}
          <div style={{ background: 'linear-gradient(145deg, #131929, #0d1520)', border: '1px solid #1e2d45', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '700', margin: '0 0 16px' }}>⚡ Quick Stats</h3>
            {[
              { label: 'Attendance Rate', value: `${attendancePct}%`, color: attendancePct >= 75 ? '#10b981' : '#ef4444', icon: '📋' },
              { label: 'Grade Average',   value: `${gradeAvg}%`,     color: gradeAvg >= 50     ? '#10b981' : '#ef4444',  icon: '📝' },
              { label: 'Passing Grades',  value: `${passingGrades}/${grades.length}`, color: '#38bdf8', icon: '✅' },
              { label: 'Days Absent',     value: absentCount, color: absentCount > 5 ? '#ef4444' : '#64748b', icon: '❌' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '13px', paddingBottom: '13px',
                borderBottom: '1px solid #1e2d45',
              }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{s.icon} {s.label}</span>
                <span style={{ color: s.color, fontSize: '14px', fontWeight: '800', textShadow: `0 0 10px ${s.color}66` }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>

          {/* Subject Performance Bar */}
          <div style={{ background: 'linear-gradient(145deg, #131929, #0d1520)', border: '1px solid #1e2d45', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '700', margin: '0 0 2px', textShadow: '0 0 10px rgba(167,139,250,0.2)' }}>📈 Subject Performance</h3>
            <p style={{ color: '#475569', fontSize: '10px', margin: '0 0 14px' }}>Score % per subject</p>
            {gradesBarData.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', padding: '30px 0', fontSize: '12px' }}>No grades yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={gradesBarData}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#a78bfa" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false}/>
                  <XAxis dataKey="name" stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }}/>
                  <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]}/>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }}/>
                  <Bar dataKey="score" name="Score %" fill="url(#subGrad)" radius={[5,5,0,0]}
                    style={{ filter: 'drop-shadow(0 0 5px rgba(167,139,250,0.5))' }}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Attendance Trend Area */}
          <div style={{ background: 'linear-gradient(145deg, #131929, #0d1520)', border: '1px solid #1e2d45', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '700', margin: '0 0 2px', textShadow: '0 0 10px rgba(56,189,248,0.2)' }}>📅 Attendance Trend</h3>
            <p style={{ color: '#475569', fontSize: '10px', margin: '0 0 14px' }}>1 = Present · 0 = Absent</p>
            {attendanceTrend.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', padding: '30px 0', fontSize: '12px' }}>No attendance yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false}/>
                  <XAxis dataKey="day" stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }}/>
                  <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 1]}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Area type="monotone" dataKey="present" name="Present" stroke="#38bdf8"
                    fill="url(#trendGrad)" strokeWidth={2.5}
                    dot={{ fill: '#38bdf8', r: 4, filter: 'drop-shadow(0 0 5px #38bdf8)' }}/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
