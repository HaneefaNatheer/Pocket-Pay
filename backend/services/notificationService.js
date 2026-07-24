const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type, link = null) => {
  return Notification.create({ user_id: userId, title, message, type, link });
};

const createBulkNotifications = async (userIds, title, message, type, link = null) => {
  const notifications = userIds.map((userId) => ({
    user_id: userId,
    title,
    message,
    type,
    link,
  }));
  return Notification.bulkCreate(notifications);
};

const notifyJobAccepted = async (studentId, jobTitle) => {
  return createNotification(
    studentId,
    'Application Accepted',
    `Congratulations! Your application for "${jobTitle}" has been accepted.`,
    'application',
    '/applications'
  );
};

const notifyJobRejected = async (studentId, jobTitle) => {
  return createNotification(
    studentId,
    'Application Update',
    `Your application for "${jobTitle}" was not successful. Keep applying!`,
    'application',
    '/applications'
  );
};

const notifyInterviewScheduled = async (studentId, jobTitle, date) => {
  const formattedDate = new Date(date).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return createNotification(
    studentId,
    'Interview Scheduled',
    `An interview for "${jobTitle}" has been scheduled for ${formattedDate}.`,
    'interview',
    '/applications'
  );
};

const notifyNewApplication = async (employerId, studentName, jobTitle) => {
  return createNotification(
    employerId,
    'New Application',
    `${studentName} has applied for "${jobTitle}".`,
    'application',
    '/employer/applications'
  );
};

const notifyNewMatchingJob = async (userIds, jobTitle) => {
  return createBulkNotifications(
    userIds,
    'New Job Match',
    `A new job "${jobTitle}" matches your profile. Check it out!`,
    'job',
    '/jobs'
  );
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyJobAccepted,
  notifyJobRejected,
  notifyInterviewScheduled,
  notifyNewApplication,
  notifyNewMatchingJob,
};
