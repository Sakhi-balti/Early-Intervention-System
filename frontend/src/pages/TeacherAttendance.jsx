import { useState, useEffect } from 'react'
import { markAttendance } from '../api/attendanceAPI'
import Sidebar from '../components/common/Sidebar'
import api from '../api/axios'

export default function TeacherAttendance() {
  const today = new Date().toISOString().split('T')[0]

  const [students,   setStudents]   = useState([])
  const [date,       setDate]       = useState(today)
  const [className,  setClassName]  = useState('CS-4A')
  const [statuses,   setStatuses]   = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result,     setResult]     = useState(null)
  const [loading,    setLoading]    = useState(true)

  // Load real students from database
  useEffect(() => {
    api.get('/users/students/')
      .then(res => {
        setStudents(res.data)
        // Initialize all as present
        const init = {}
        res.data.forEach(s => { init[s.id] = 'present' })
        setStatuses(init)
      })
      .catch(err => console.error('Failed to load students:', err))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id) => {
    setStatuses(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true); setResult(null)
    try {
      const promises = students.map(s =>
        markAttendance({
          student:    s.id,
          date:       date,
          status:     statuses[s.id],
          class_name: className,
        })
      )
      await Promise.all(promises)
      setResult({ type: 'success', msg: `✅ Attendance saved for ${students.length} students! Risk scores are updating...` })
    } catch (err) {
      setResult({ type: 'error', msg: `❌ Error: ${JSON.stringify(err.response?.data || 'Failed')}` })
    } finally {
      setSubmitting(false)
    }
  }

  const presentCount = Object.values(statuses).filter(s => s === 'present').length
  const absentCount  = students.length - presentCount

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            📋 Mark Attendance
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            Marking attendance automatically updates each student's risk score
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', background: '#131929',
                border: '1px solid #1e2d45', color: '#e2e8f0', fontSize: '13px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Class
            </label>
            <input type="text" value={className} onChange={e => setClassName(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', background: '#131929',
                border: '1px solid #1e2d45', color: '#e2e8f0', fontSize: '13px', outline: 'none', width: '120px' }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total',   value: students.length, color: '#64748b' },
            { label: 'Present', value: presentCount,    color: '#10b981' },
            { label: 'Absent',  value: absentCount,     color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#131929', border: '1px solid #1e2d45',
              borderRadius: '10px', padding: '12px 20px', textAlign: 'center',
            }}>
              <div style={{ color: stat.color, fontSize: '22px', fontWeight: '800' }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Student list */}
        <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 20px',
            background: '#0f172a', borderBottom: '1px solid #1e2d45' }}>
            {['Student Name', 'Department', 'Status'].map(h => (
              <span key={h} style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</span>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              Loading students from database...
            </div>
          )}

          {/* No students */}
          {!loading && students.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              No students found. Register students first at /register
            </div>
          )}

          {/* Rows */}
          {students.map((student, i) => {
            const isPresent = statuses[student.id] === 'present'
            return (
              <div key={student.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < students.length - 1 ? '1px solid #1e2d45' : 'none',
                background: isPresent ? 'transparent' : 'rgba(239,68,68,0.05)',
              }}>
                <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                  {student.username}
                </span>
                <span style={{ color: '#64748b', fontSize: '12px' }}>
                  {student.department || '—'}
                </span>
                <button onClick={() => toggle(student.id)} style={{
                  width: '110px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '12px', border: 'none', transition: 'all 0.2s',
                  background: isPresent ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color:      isPresent ? '#10b981'                : '#ef4444',
                }}>
                  {isPresent ? '✓ Present' : '✗ Absent'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Result */}
        {result && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
            background: result.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border:     result.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
            color:      result.type === 'success' ? '#10b981' : '#ef4444',
          }}>
            {result.msg}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={submitting || students.length === 0} style={{
          padding: '12px 32px', borderRadius: '8px',
          background: submitting || students.length === 0 ? '#1e2d45' : '#0ea5e9',
          color: 'white', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
        }}>
          {submitting ? 'Saving...' : `💾 Save Attendance (${students.length} students)`}
        </button>

      </main>
    </div>
  )
}
