import api from './axiosInstance.js';

export const getProgressApi         = (moduleId) => api.get(`/progress/${moduleId}`);
export const markSectionCompleteApi = (moduleId, section) =>
  api.put(`/progress/${moduleId}/section`, { section });
export const getPerformanceSummaryApi = (moduleId) =>
  api.get(`/progress/${moduleId}/summary`);
export const getCompletedActivitiesApi = () => api.get('/progress/completed');
