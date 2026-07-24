const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const contactMessage = await ContactMessage.create({ name, email, subject, message });

    return res.status(201).json({ success: true, message: 'Message submitted successfully', data: contactMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved',
      data: messages,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const replyToMessage = async (req, res) => {
  try {
    const { to, subject, reply } = req.body;

    if (!to || !subject || !reply) {
      return res.status(400).json({ success: false, message: 'to, subject, and reply are required' });
    }

    const message = await ContactMessage.findByPk(req.params.id);
    if (message) {
      await message.update({ admin_reply: reply, is_resolved: true });
    }

    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@pocket-pay.com',
      to,
      subject,
      text: reply,
    });

    return res.status(200).json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Failed to send reply: ${error.message}` });
  }
};

module.exports = {
  submitContact,
  getContactMessages,
  replyToMessage,
};
