import api from './api';

export const applicationService = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my-applications'),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.put(`/applications/${id}/interview`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
  getById: (id) => api.get(`/applications/${id}`),
};
