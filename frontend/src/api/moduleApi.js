import api from './axiosInstance.js';

export const getModulesApi      = ()     => api.get('/modules');
export const getModuleByIdApi   = (id)   => api.get(`/modules/${id}`);
export const getObjectivesApi   = (id)   => api.get(`/modules/${id}/objectives`);
export const getCompetenciesApi = (id)   => api.get(`/modules/${id}/competencies`);
export const getLessonApi       = (id)   => api.get(`/modules/${id}/lesson`);

export const createModuleApi = (data) => api.post('/modules', data);
export const updateModuleApi = (id, data) => api.put(`/modules/${id}`, data);

// A date publishes and schedules the topic. Null locks it again.
export const setReleaseDateApi  = (id, releaseDate) =>
  api.put(`/modules/${id}/release`, { releaseDate });
