import api from './axiosInstance.js';

export const getReflectionApi  = (moduleId)          => api.get(`/reflections/${moduleId}`);
export const saveReflectionApi = (moduleId, content) => api.put(`/reflections/${moduleId}`, { content });
export const deleteReflectionApi = (moduleId)        => api.delete(`/reflections/${moduleId}`);
