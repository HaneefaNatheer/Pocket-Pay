const Notification = require('../models/Notification');
const { Op } = require('sequelize');

const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data: notifications,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.update({ is_read: true });

    return res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    return res.status(200).json({
      success: true,
      message: 'Unread count retrieved',
      data: { unreadCount: count },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.destroy();

    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
