import { useState, useEffect } from 'react'
import Sidebar from '../components/common/Sidebar'
import api from '../api/axios'

const INCIDENT_TYPES = [
  { value: 'misconduct',    label: '😤 Misconduct',         desc: 'Disruptive behavior in class' },
  { value: 'absence',       label: '🚫 Unexplained Absence', desc: 'Absent without reason' },
  { value: 'bullying',      label: '👊 Bullying',            desc: 'Bullying other students' },
  { value: 'cheating',      label: '📋 Cheating',            desc: 'Academic dishonesty' },
  { value: 'disrespect',    label: '🗣️ Disrespect',          desc: 'Disrespectful to teacher/staff' },
  { value: 'late',          label: '⏰ Repeatedly Late',     desc: 'Coming late to class' },
  { value: 'phone_misuse',  label: '📱 Phone Misuse',        desc: 'Unauthorized phone use' },
  { value: 'other',         label: '📌 Other',               desc: 'Other behavioral issue' },
]

const SEVERITY = [
  { value: 'minor',    label: 'Minor',    color: '#f59e0b' },
  { value: 'moderate', label: 'Moderate', color: '#f97316' },
  { value: 'severe',   label: 'Severe',   color: '#ef4444' },
]

export default function BehaviorIncidents() {
  const [students,   setStudents]   = useState([])
  const [incidents,  setIncidents]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [result,     setResult]     = useState(null)

  const [form, setForm] = useState({
    student:       '',
    incident_type: 'misconduct',
    severity:      'minor',
    description:   '',
    date:          new Date().toISOString().split('T')[0],
  })

  // Load students
  useEffect(() => {
    api.get('/users/students/')
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Load existing incidents for selected student
  useEffect(() => {
    if (form.student) {
      api.get(`/interventions/list/?student_id=${form.student}`)
        .then(res => setIncidents(res.data))
        .catch(() => setIncidents([]))
    }
  }, [form.student])

  const handleSubmit = async () => {
    if (!form.student || !form.description) {
      setResult({ type: 'error', msg: '❌ Please select a student and add a description' })
      return
    }
    setSaving(true); setResult(null)
    try {
      // Save as intervention with action_type = behavior
      await api.post('/interventions/', {
        student:     parseInt(form.student),
        action_type: 'behavior',
        notes:       `[${form.incident_type.toUpperCase()}] [${form.severity.toUpperCase()}] ${form.description}`,
        status:      'pending',
      })

      setResult({ type: 'success', msg: '✅ Incident recorded! Risk score will update automatically.' })

      // Reload incidents
      const res = await api.get(`/interventions/list/?student_id=${form.student}`)
      setIncidents(res.data)
      setForm(prev => ({ ...prev, description: '' }))
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
            ⚠️ Behavior Incidents
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            Recording an incident increases the student's risk score automatically
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* LEFT — Report form */}
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '700', margin: '0 0 20px' }}>
              📋 Report Incident
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

            {/* Incident type grid */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Incident Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {INCIDENT_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm({ ...form, incident_type: t.value })}
                    style={{
                      padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                      textAlign: 'left', fontSize: '12px', fontWeight: '600',
                      border: form.incident_type === t.value ? '1px solid #f59e0b' : '1px solid #1e2d45',
                      background: form.incident_type === t.value ? 'rgba(245,158,11,0.1)' : '#0f172a',
                      color: form.incident_type === t.value ? '#f59e0b' : '#64748b',
                      transition: 'all 0.15s',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Severity</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {SEVERITY.map(s => (
                  <button key={s.value} onClick={() => setForm({ ...form, severity: s.value })}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: '700', border: 'none',
                      background: form.severity === s.value ? `${s.color}22` : '#0f172a',
                      color: form.severity === s.value ? s.color : '#64748b',
                      border: form.severity === s.value ? `1px solid ${s.color}55` : '1px solid #1e2d45',
                      transition: 'all 0.15s',
                      boxShadow: form.severity === s.value ? `0 0 10px ${s.color}33` : 'none',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={inputStyle} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} rows={3}
                placeholder="Describe what happened..."
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, resize: 'none', lineHeight: '1.5' }} />
            </div>

            {/* Result */}
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
              background: saving ? '#1e2d45' : '#f97316',
              color: 'white', border: 'none', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
              boxShadow: saving ? 'none' : '0 0 16px rgba(249,115,22,0.3)',
            }}>
              {saving ? 'Recording...' : '⚠️ Record Incident'}
            </button>
          </div>

          {/* RIGHT — Incident history */}
          <div style={{ background: '#131929', border: '1px solid #1e2d45', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: '15px', fontWeight: '700' }}>
                📁 Incident History
                {form.student && (
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>
                    — {students.find(s => s.id == form.student)?.username}
                  </span>
                )}
              </h3>
              {incidents.length > 0 && (
                <span style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                  {incidents.length} records
                </span>
              )}
            </div>

            {!form.student && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Select a student to see their incident history
              </div>
            )}

            {form.student && incidents.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                ✅ No incidents recorded for this student
              </div>
            )}

            <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
              {incidents.map((inc, i) => {
                const notes = inc.notes || ''
                const isBehavior = notes.includes('[MISCONDUCT]') || notes.includes('[BEHAVIOR]') ||
                  notes.includes('[BULLYING]') || notes.includes('[CHEATING]') ||
                  notes.includes('[DISRESPECT]') || notes.includes('[LATE]') ||
                  notes.includes('[ABSENCE]') || notes.includes('[PHONE_MISUSE]') ||
                  notes.includes('[OTHER]') || inc.action_type === 'behavior'

                const severityColor = notes.includes('[SEVERE]') ? '#ef4444'
                  : notes.includes('[MODERATE]') ? '#f97316' : '#f59e0b'

                return (
                  <div key={inc.id} style={{
                    padding: '14px 20px',
                    borderBottom: i < incidents.length - 1 ? '1px solid #1e2d45' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                        color: severityColor, letterSpacing: '0.5px',
                        background: `${severityColor}18`, padding: '2px 8px', borderRadius: '4px',
                      }}>
                        {inc.action_type?.replace('_', ' ')}
                      </span>
                      <span style={{ color: '#475569', fontSize: '11px' }}>
                        {inc.created_at ? new Date(inc.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                      {notes || 'No description'}
                    </p>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: '600',
                        color: inc.status === 'done' ? '#10b981' : '#f59e0b',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        ● {inc.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
