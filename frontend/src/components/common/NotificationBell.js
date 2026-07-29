import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiMail, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';

const iconMap = {
  info: <FiInfo className="text-primary" />,
  success: <FiCheck className="text-success" />,
  warning: <FiAlertCircle className="text-warning" />,
  error: <FiAlertCircle className="text-danger" />,
  message: <FiMail className="text-info" />,
};

const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 10 });
      const data = response.data?.notifications || response.notifications || response.data || [];
      setNotifications(Array.isArray(data) ? data.slice(0, 10) : []);
      const count = response.data?.unreadCount ?? response.unreadCount ?? 0;
      setUnreadCount(count);
    } catch (err) {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // silently fail
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="link"
        className="pp-theme-toggle position-relative"
        id="notification-bell"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem', padding: '0.25em 0.45em' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm border-0 p-0" style={{ width: 360, maxHeight: 420 }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0 fw-bold">Notifications</h6>
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="p-0 small text-decoration-none"
              onClick={handleMarkAllRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="overflow-auto" style={{ maxHeight: 320 }}>
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-secondary small">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`d-flex align-items-start p-3 border-bottom cursor-pointer ${!notification.read ? 'bg-primary bg-opacity-10' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleMarkRead(notification._id)}
              >
                <div className="me-2 mt-1 flex-shrink-0">
                  {iconMap[notification.type] || iconMap.info}
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-0 small fw-semibold text-truncate">
                    {notification.title}
                  </p>
                  <p className="mb-0 small text-secondary text-truncate">
                    {notification.message}
                  </p>
                  <small className="text-muted">
                    {timeAgo(notification.createdAt)}
                  </small>
                </div>
                {!notification.read && (
                  <div className="ms-2 mt-2">
                    <div className="bg-primary rounded-circle" style={{ width: 8, height: 8 }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-2 border-top text-center">
          <Link
            to="/notifications"
            className="text-primary text-decoration-none small fw-semibold"
          >
            View all notifications
          </Link>
        </div>
      </Dropdown.Menu>

      <style>{`
        .cursor-pointer:hover { background-color: rgba(0,0,0,0.03); }
      `}</style>
    </Dropdown>
  );
};

export default NotificationBell;
