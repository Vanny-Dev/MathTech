import api from './axiosInstance.js';

// Any authenticated user — what a student's or teacher's own client uses to
// decide whether/how to render ads.
export const getAdSettingsApi = () => api.get('/ads/settings');

// Developer only — the control panel's read/write, plus its audit trail.
export const getDeveloperAdSettingsApi = () => api.get('/developer/ads/settings');
export const updateDeveloperAdSettingsApi = (settings) => api.put('/developer/ads/settings', settings);
export const getAdAuditLogApi = (limit = 50) => api.get(`/developer/ads/audit-log?limit=${limit}`);
