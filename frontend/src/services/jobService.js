import api from './api';

export const jobService = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  search: (params) => api.get('/jobs/search', { params }),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  save: (id) => api.post(`/jobs/${id}/save`),
  unsave: (id) => api.delete(`/jobs/${id}/save`),
  checkSaved: (id) => api.get(`/jobs/${id}/check-saved`),
  getSaved: () => api.get('/jobs/saved'),
  getByEmployer: (id) => api.get(`/jobs/employer/${id}`),
};
