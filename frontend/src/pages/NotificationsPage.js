import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { BsBell, BsCheckAll, BsTrash, BsArrowLeft } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ limit: 50 });
      setNotifications(res.data || []);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted.');
    } catch {
      toast.error('Failed to delete notification.');
    }
    setShowDeleteModal(null);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch { }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="btn btn-outline-secondary btn-sm"><BsArrowLeft /></Link>
          <h4 className="fw-bold mb-0">Notifications</h4>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button className="btn btn-sm btn-outline-primary" onClick={handleMarkAllRead}>
            <BsCheckAll className="me-1" /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="list-group">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`list-group-item list-group-item-action d-flex align-items-start gap-3 py-3 ${n.is_read ? '' : 'bg-light'}`}
              style={{ borderLeft: n.is_read ? 'none' : '3px solid #0d6efd' }}
            >
              <div className="mt-1">
                <BsBell className={n.is_read ? 'text-muted' : 'text-primary'} size={18} />
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.95rem' }}>{n.title}</h6>
                    <p className="mb-0 text-muted small mt-1">{n.message}</p>
                    {n.link && (
                      <Link to={n.link} className="small text-decoration-none mt-1 d-inline-block" onClick={() => handleMarkRead(n.id)}>
                        View details →
                      </Link>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-3">
                    <small className="text-muted" style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{getTimeAgo(n.createdAt)}</small>
                    {!n.is_read && (
                      <button className="btn btn-sm p-0 text-primary" title="Mark as read" onClick={() => handleMarkRead(n.id)}>
                        <BsCheckAll size={16} />
                      </button>
                    )}
                    <button className="btn btn-sm p-0 text-danger" title="Delete" onClick={() => setShowDeleteModal(n.id)}>
                      <BsTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <BsBell size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No notifications</h5>
          <p className="text-muted">You're all caught up!</p>
        </div>
      )}

      <Modal show={!!showDeleteModal} onHide={() => setShowDeleteModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this notification?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(showDeleteModal)}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
