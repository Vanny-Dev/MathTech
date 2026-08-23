import api from './axiosInstance.js';

export const getScoreApi           = (id) => api.get(`/feedback/${id}`);
export const getCorrectAnswersApi  = (id) => api.get(`/feedback/${id}/answers`);
export const getIncorrectAnswersApi= (id) => api.get(`/feedback/${id}/incorrect`);

// Recovers the student's own latest graded submission for a topic, so the score
// and review pages still work after a refresh has emptied Redux.
export const getLatestSubmissionApi = (moduleId) => api.get(`/feedback/latest/${moduleId}`);
