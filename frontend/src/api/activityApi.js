import api from './axiosInstance.js';

export const getActivitiesApi = (moduleId, isPractice) =>
  api.get('/activities', { params: { moduleId, isPractice } });

export const submitAnswersApi = (data) => api.post('/activities/submit', data);
