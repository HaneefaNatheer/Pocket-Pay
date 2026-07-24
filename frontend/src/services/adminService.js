import api from './api';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getEmployers: (params) => api.get('/admin/employers', { params }),
  verifyEmployer: (id) => api.put(`/admin/verify-employer/${id}`),
  blockUser: (id) => api.put(`/admin/block-user/${id}`),
  unblockUser: (id) => api.put(`/admin/unblock-user/${id}`),
  removeJob: (id) => api.delete(`/admin/job/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  toggleReview: (id) => api.put(`/admin/reviews/${id}/visibility`),
  getLogs: () => api.get('/admin/logs'),
  getAnalytics: () => api.get('/analytics/overview'),
};
