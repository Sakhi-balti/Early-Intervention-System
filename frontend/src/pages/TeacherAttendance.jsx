import { useState } from 'react'
import { markAttendance } from '../api/attendanceAPI'
import Sidebar from '../components/common/Sidebar'
import { useAuth } from '../context/AuthContext'

// Mock student list — later replace with API call to get real students
const SAMPLE_STUDENTS = [
  { id: 2, name: 'Ali Hassan',    roll: 'F22BINFT1M01001' },
  { id: 3, name: 'Sara Khan',     roll: 'F22BINFT1M01002' },
  { id: 4, name: 'Usman Ahmed',   roll: 'F22BINFT1M01003' },
  { id: 5, name: 'Noor Fatima',   roll: 'F22BINFT1M01174' },
  { id: 6, name: 'Bilal Raza',    roll: 'F22BINFT1M01005' },
  { id: 7, name: 'Ayesha Malik',  roll: 'F22BINFT1M01006' },
]

export default function TeacherAttendance() {
  const { user } = useAuth()
  const today    = new Date().toISOString().split('T')[0]

  const [date,      setDate]      = useState(today)
  const [className, setClassName] = useState('CS-4A')
  // Initialize all students as present
  const [statuses,  setStatuses]  = useState(
    Object.fromEntries(SAMPLE_STUDENTS.map(s => [s.id, 'present']))
  )
  const [submitting, setSubmitting] = useState(false)
  const [result,     setResult]     = useState(null)

  const toggle = (id) => {
    setStatuses(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true); setResult(null)
    try {
      // Send one record per student to Django
      const promises = SAMPLE_STUDENTS.map(s =>
        markAttendance({
          student:    s.id,
          date:       date,
          status:     statuses[s.id],
          class_name: className,
        })
      )
      await Promise.all(promises)
      setResult({ type: 'success', msg: `✅ Attendance saved for ${SAMPLE_STUDENTS.length} students! Risk scores are updating...` })
    } catch (err) {
      setResult({ type: 'error', msg: '❌ Failed to save. Check your connection.' })
    } finally {
      setSubmitting(false)
    }
  }

  const presentCount = Object.values(statuses).filter(s => s === 'present').length
  const absentCount  = SAMPLE_STUDENTS.length - presentCount

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            📋 Mark Attendance
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            Marking attendance triggers real-time risk score update for each student
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

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total',   value: SAMPLE_STUDENTS.length, color: '#64748b' },
            { label: 'Present', value: presentCount,           color: '#10b981' },
            { label: 'Absent',  value: absentCount,            color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#131929', border: '1px solid #1e2d45', borderRadius: '10px',
              padding: '12px 20px', textAlign: 'center',
            }}>
              <div style={{ color: stat.color, fontSize: '22px', fontWeight: '800' }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Student list */}
        <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 20px',
            background: '#0f172a', borderBottom: '1px solid #1e2d45' }}>
            {['Student Name', 'Roll Number', 'Status'].map(h => (
              <span key={h} style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {SAMPLE_STUDENTS.map((student, i) => {
            const isPresent = statuses[student.id] === 'present'
            return (
              <div key={student.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < SAMPLE_STUDENTS.length - 1 ? '1px solid #1e2d45' : 'none',
                background: isPresent ? 'transparent' : 'rgba(239,68,68,0.05)',
                transition: 'background 0.2s',
              }}>
                <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500' }}>
                  {student.name}
                </span>
                <span style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                  {student.roll}
                </span>
                {/* Toggle button */}
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

        {/* Result message */}
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
        <button onClick={handleSubmit} disabled={submitting} style={{
          padding: '12px 32px', borderRadius: '8px', background: submitting ? '#1e2d45' : '#0ea5e9',
          color: 'white', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
        }}>
          {submitting ? 'Saving...' : `💾 Save Attendance (${SAMPLE_STUDENTS.length} students)`}
        </button>

      </main>
    </div>
  )
}
