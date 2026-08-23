import api from './axiosInstance.js';

export const getProgressApi         = (moduleId) => api.get(`/progress/${moduleId}`);
export const markSectionCompleteApi = (moduleId, section) =>
  api.put(`/progress/${moduleId}/section`, { section });
export const getPerformanceSummaryApi = (moduleId) =>
  api.get(`/progress/${moduleId}/summary`);
export const getCompletedActivitiesApi = () => api.get('/progress/completed');

// Where this student stands on every topic, in one call — drives the Completed
// badges on the topics list.
export const getMyProgressApi = () => api.get('/progress/mine');
