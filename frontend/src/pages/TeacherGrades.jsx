import { useState, useEffect } from 'react'
import Sidebar from '../components/common/Sidebar'
import api from '../api/axios'
import { addGrade, getGrades } from '../api/otherAPIs'

export default function TeacherGrades() {
  const [students, setStudents] = useState([])
  const [grades,   setGrades]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [result,   setResult]   = useState(null)

  const [form, setForm] = useState({
    student:    '',
    subject:    '',
    exam_type:  'quiz',
    score:      '',
    total:      '100',
    date:       new Date().toISOString().split('T')[0],
  })

  // Load all students from DB
  useEffect(() => {
    api.get('/users/students/')
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Load grades when student is selected
  useEffect(() => {
    if (form.student) {
      getGrades(form.student).then(res => setGrades(res.data))
    }
  }, [form.student])

  const handleSubmit = async () => {
    if (!form.student || !form.subject || !form.score) {
      setResult({ type: 'error', msg: '❌ Please fill Student, Subject and Score' })
      return
    }
    setSaving(true); setResult(null)
    try {
      await addGrade({
        student:   parseInt(form.student),
        subject:   form.subject,
        exam_type: form.exam_type,
        score:     parseFloat(form.score),
        total:     parseFloat(form.total),
        date:      form.date,
      })
      setResult({ type: 'success', msg: '✅ Grade saved! Risk score will update automatically.' })
      // Reload grades
      const res = await getGrades(form.student)
      setGrades(res.data)
      // Reset score field
      setForm(prev => ({ ...prev, score: '', subject: '' }))
    } catch (err) {
      setResult({ type: 'error', msg: `❌ ${JSON.stringify(err.response?.data || 'Failed')}` })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    background: '#0f172a', border: '1px solid #1e2d45',
    color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = {
    color: '#94a3b8', fontSize: '11px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '1px',
    display: 'block', marginBottom: '5px',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            📝 Enter Grades
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            Saving a grade automatically updates the student's risk score
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* LEFT — Grade entry form */}
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '700', margin: '0 0 20px' }}>
              Add New Grade
            </h3>

            {/* Student */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Select Student</label>
              <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.username}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Subject</label>
              <input type="text" value={form.subject} placeholder="e.g. Mathematics"
                onChange={e => setForm({ ...form, subject: e.target.value })}
                style={inputStyle} />
            </div>

            {/* Exam Type */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Exam Type</label>
              <select value={form.exam_type} onChange={e => setForm({ ...form, exam_type: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            {/* Score and Total */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Score</label>
                <input type="number" value={form.score} placeholder="e.g. 75"
                  min="0" max={form.total}
                  onChange={e => setForm({ ...form, score: e.target.value })}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Total Marks</label>
                <input type="number" value={form.total} placeholder="100"
                  onChange={e => setForm({ ...form, total: e.target.value })}
                  style={inputStyle} />
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={inputStyle} />
            </div>

            {/* Percentage preview */}
            {form.score && form.total && (
              <div style={{
                background: '#0f172a', borderRadius: '8px', padding: '10px 14px',
                marginBottom: '16px', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Percentage</span>
                <span style={{
                  fontSize: '14px', fontWeight: '700',
                  color: (form.score / form.total * 100) >= 50 ? '#10b981' : '#ef4444'
                }}>
                  {((form.score / form.total) * 100).toFixed(1)}%
                </span>
              </div>
            )}

            {/* Result message */}
            {result && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px',
                background: result.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border:     result.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                color:      result.type === 'success' ? '#10b981' : '#ef4444',
              }}>
                {result.msg}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={saving} style={{
              width: '100%', padding: '11px', borderRadius: '8px',
              background: saving ? '#1e2d45' : '#10b981',
              color: 'white', border: 'none', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
            }}>
              {saving ? 'Saving...' : '💾 Save Grade'}
            </button>
          </div>

          {/* RIGHT — Grade history for selected student */}
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d45' }}>
              <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '700', margin: 0 }}>
                📋 Grade History
                {form.student && (
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>
                    — {students.find(s => s.id == form.student)?.username}
                  </span>
                )}
              </h3>
            </div>

            {!form.student && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Select a student to see their grade history
              </div>
            )}

            {form.student && grades.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No grades yet for this student
              </div>
            )}

            {/* Grade rows */}
            {grades.map((g, i) => {
              const pct = ((g.score / g.total) * 100).toFixed(1)
              const pass = parseFloat(pct) >= 50
              return (
                <div key={i} style={{
                  padding: '14px 20px',
                  borderBottom: i < grades.length - 1 ? '1px solid #1e2d45' : 'none',
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center', gap: '12px',
                }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>{g.subject}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                      {g.exam_type} · {g.date}
                    </div>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                    {g.score}/{g.total}
                  </div>
                  <div style={{
                    color: pass ? '#10b981' : '#ef4444',
                    fontSize: '13px', fontWeight: '700', minWidth: '50px', textAlign: 'right'
                  }}>
                    {pct}%
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </main>
    </div>
  )
}
