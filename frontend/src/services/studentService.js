import api from './api';

export const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  uploadPicture: (formData) => api.post('/students/upload-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCV: (formData) => api.post('/students/upload-cv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getTimetable: () => api.get('/students/timetable'),
  addTimetable: (data) => api.post('/students/timetable', data),
  updateTimetable: (id, data) => api.put(`/students/timetable/${id}`, data),
  deleteTimetable: (id) => api.delete(`/students/timetable/${id}`),
  getSkills: () => api.get('/students/skills'),
  addSkill: (data) => api.post('/students/skills', data),
  removeSkill: (id) => api.delete(`/students/skills/${id}`),
  getRecommendedJobs: () => api.get('/students/recommended-jobs'),
};
