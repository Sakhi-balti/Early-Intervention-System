import api from './axios'

// Teacher marks attendance
export const markAttendance  = (data)      => api.post('/attendance/', data)

// Get attendance history for a student
export const getAttendance   = (studentId) => api.get(`/attendance/list/?student_id=${studentId}`)
