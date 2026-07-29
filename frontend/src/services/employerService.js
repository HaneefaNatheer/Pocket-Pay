import api from './api';

export const employerService = {
  getProfile: () => api.get('/employers/profile'),
  updateProfile: (data) => api.put('/employers/profile', data),
  uploadLogo: (formData) => api.post('/employers/upload-logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyJobs: () => api.get('/employers/my-jobs'),
  getJobApplicants: (jobId) => api.get(`/employers/job/${jobId}/applicants`),
  downloadCV: (studentId) => api.get(`/employers/download-cv/${studentId}`, { responseType: 'blob' }),
};
