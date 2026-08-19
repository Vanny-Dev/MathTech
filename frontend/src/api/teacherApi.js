import api from './axiosInstance.js';

export const getAllStudentsApi    = ()                         => api.get('/teacher/students');
export const getModuleProgressApi= (moduleId)                 => api.get(`/teacher/monitor/${moduleId}`);
export const getStudentDetailApi = (moduleId, studentId)      => api.get(`/teacher/monitor/${moduleId}/student/${studentId}`);
export const getClassSummaryApi  = (moduleId)                 => api.get(`/teacher/monitor/${moduleId}/summary`);

// Teacher only — permanently removes the accounts and everything they own
export const deleteStudentsApi   = (studentIds)               => api.post('/teacher/students/delete', { studentIds });
