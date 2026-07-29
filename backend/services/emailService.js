const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendVerificationEmail = async (user, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Pocket-Pay" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Email - Pocket-Pay',
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#2563eb;">Welcome to Pocket-Pay!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break:break-all;color:#6b7280;">${verifyUrl}</p>
        <p style="color:#9ca3af;font-size:12px;">This link will expire in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const transporter = createTransporter();
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Pocket-Pay" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset Your Password - Pocket-Pay',
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#2563eb;">Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break:break-all;color:#6b7280;">${resetUrl}</p>
        <p style="color:#9ca3af;font-size:12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

const sendInterviewInvitation = async (studentEmail, employerName, jobTitle, date, location) => {
  const transporter = createTransporter();
  const formattedDate = new Date(date).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  await transporter.sendMail({
    from: `"Pocket-Pay" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `Interview Invitation - ${jobTitle} at ${employerName}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#2563eb;">Interview Invitation</h2>
        <p>You have been invited for an interview!</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;font-weight:bold;">Company:</td><td style="padding:8px;">${employerName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Position:</td><td style="padding:8px;">${jobTitle}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Date & Time:</td><td style="padding:8px;">${formattedDate}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Location:</td><td style="padding:8px;">${location}</td></tr>
        </table>
        <p>Please confirm your availability through the Pocket-Pay platform.</p>
        <a href="${FRONTEND_URL}/applications" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">View Application</a>
      </div>
    `,
  });
};

const sendApplicationStatusEmail = async (studentEmail, jobTitle, status) => {
  const transporter = createTransporter();

  const statusMessages = {
    reviewed: { title: 'Application Reviewed', message: 'Your application has been reviewed by the employer.' },
    shortlisted: { title: 'Application Shortlisted', message: 'Great news! Your application has been shortlisted.' },
    interview: { title: 'Interview Stage', message: 'You have been moved to the interview stage. Check your dashboard for details.' },
    accepted: { title: 'Application Accepted', message: 'Congratulations! Your application has been accepted.' },
    rejected: { title: 'Application Update', message: 'We regret to inform you that your application was not successful this time.' },
  };

  const { title, message } = statusMessages[status] || { title: 'Application Update', message: 'Your application status has been updated.' };

  await transporter.sendMail({
    from: `"Pocket-Pay" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `${title} - ${jobTitle}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#2563eb;">${title}</h2>
        <p>Regarding your application for <strong>${jobTitle}</strong>:</p>
        <p>${message}</p>
        <a href="${FRONTEND_URL}/applications" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">View Application</a>
      </div>
    `,
  });
};

const sendNewApplicationEmail = async (employerEmail, studentName, jobTitle) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Pocket-Pay" <${process.env.EMAIL_USER}>`,
    to: employerEmail,
    subject: `New Application Received - ${jobTitle}`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#2563eb;">New Application Received</h2>
        <p>A new application has been submitted for your job posting <strong>${jobTitle}</strong>.</p>
        <p><strong>Applicant:</strong> ${studentName}</p>
        <a href="${FRONTEND_URL}/employer/applications" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Review Application</a>
      </div>
    `,
  });
};

const sendContactReply = async (email, name, subject, message) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Pocket-Pay" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Re: ${subject} - Pocket-Pay Support`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h2 style="color:#2563eb;">Pocket-Pay Support</h2>
        <p>Hi ${name},</p>
        <p>Thank you for contacting us. Here is our response to your inquiry about <strong>${subject}</strong>:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">${message}</div>
        <p>If you have further questions, feel free to reply to this email.</p>
        <p style="color:#9ca3af;font-size:12px;">Pocket-Pay Team</p>
      </div>
    `,
  });
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInterviewInvitation,
  sendApplicationStatusEmail,
  sendNewApplicationEmail,
  sendContactReply,
};
