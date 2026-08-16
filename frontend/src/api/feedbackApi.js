import api from './axiosInstance.js';

export const getScoreApi           = (id) => api.get(`/feedback/${id}`);
export const getCorrectAnswersApi  = (id) => api.get(`/feedback/${id}/answers`);
export const getIncorrectAnswersApi= (id) => api.get(`/feedback/${id}/incorrect`);
