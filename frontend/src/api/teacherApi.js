import api from './axiosInstance.js';

export const getAllStudentsApi    = ()                         => api.get('/teacher/students');
export const getModuleProgressApi= (moduleId)                 => api.get(`/teacher/monitor/${moduleId}`);
export const getStudentDetailApi = (moduleId, studentId)      => api.get(`/teacher/monitor/${moduleId}/student/${studentId}`);
export const getClassSummaryApi  = (moduleId)                 => api.get(`/teacher/monitor/${moduleId}/summary`);

// Teacher only — permanently removes the accounts and everything they own
export const deleteStudentsApi   = (studentIds)               => api.post('/teacher/students/delete', { studentIds });

// Teacher only — issues a brand new access code, replacing the student's old one
export const resetStudentCodeApi = (studentId)          => api.post(`/teacher/students/${studentId}/code`);

// Teacher only — gives a code to every student who does not have one yet
export const issueMissingCodesApi= ()                    => api.post('/teacher/students/codes/issue');
