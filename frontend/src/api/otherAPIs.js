import api from './axios'

// ── Grades ──────────────────────────────────
export const addGrade       = (data)      => api.post('/grades/', data)
export const getGrades      = (studentId) => api.get(`/grades/list/?student_id=${studentId}`)

// ── Risk ────────────────────────────────────
export const getRiskScores  = (studentId) => api.get(`/risk/?student_id=${studentId}`)
export const getHighRisk    = ()          => api.get('/risk/high/')

// ── Alerts ──────────────────────────────────
export const getMyAlerts    = ()          => api.get('/alerts/')
export const markAlertRead  = (id)        => api.patch(`/alerts/${id}/read/`)

// ── Interventions ────────────────────────────
export const addIntervention    = (data)      => api.post('/interventions/', data)
export const getInterventions   = (studentId) => api.get(`/interventions/list/?student_id=${studentId}`)
