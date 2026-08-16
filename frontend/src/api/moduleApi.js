import api from './axiosInstance.js';

export const getModulesApi      = ()     => api.get('/modules');
export const getModuleByIdApi   = (id)   => api.get(`/modules/${id}`);
export const getObjectivesApi   = (id)   => api.get(`/modules/${id}/objectives`);
export const getCompetenciesApi = (id)   => api.get(`/modules/${id}/competencies`);
export const getLessonApi       = (id)   => api.get(`/modules/${id}/lesson`);

// Teacher only — schedule when a topic opens. Pass null to open it immediately.
export const setReleaseDateApi  = (id, releaseDate) =>
  api.put(`/modules/${id}/release`, { releaseDate });
