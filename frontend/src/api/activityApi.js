import api from './axiosInstance.js';

export const getActivitiesApi = (moduleId, isPractice) =>
  api.get('/activities', { params: { moduleId, isPractice } });

export const submitAnswersApi = (data) => api.post('/activities/submit', data);
export const createActivityApi = (data) => api.post('/activities', data);
export const updateActivityApi = (id, data) => api.put(`/activities/${id}`, data);
export const reorderActivitiesApi = (moduleId, activityIds) => api.put('/activities/reorder', { moduleId, activityIds });
