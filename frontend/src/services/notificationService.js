import api from './api';

const mapNotification = (n) => ({
  id: n.id,
  _id: n.id,
  title: n.title,
  message: n.message,
  type: n.type || 'info',
  read: n.is_read,
  is_read: n.is_read,
  createdAt: n.created_at,
  created_at: n.created_at,
  link: n.link,
});

export const notificationService = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getNotifications: async (params = {}) => {
    const res = await api.get('/notifications', { params });
    const data = res.data?.data || res.data?.notifications || res.data || [];
    const notifications = Array.isArray(data) ? data.map(mapNotification) : [];
    let unreadCount = res.data?.unreadCount ?? 0;
    if (unreadCount === 0 && notifications.length > 0) {
      unreadCount = notifications.filter(n => !n.is_read).length;
    }
    return { data: notifications, unreadCount };
  },
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};
