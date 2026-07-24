const { Op } = require('sequelize');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');
const Employer = require('../models/Employer');
const Notification = require('../models/Notification');

const applyForJob = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { job_id, cover_letter } = req.body;
    if (!job_id) {
      return res.status(400).json({ success: false, message: 'job_id is required' });
    }

    const job = await Job.findByPk(job_id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Job is not active' });
    }

    const existing = await Application.findOne({ where: { student_id: student.id, job_id: job.id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already applied for this job' });
    }

    if (job.current_applicants >= job.max_applicants) {
      return res.status(400).json({ success: false, message: 'Maximum applicants reached' });
    }

    const application = await Application.create({
      student_id: student.id,
      job_id: job.id,
      cover_letter,
    });

    await job.update({ current_applicants: job.current_applicants + 1 });

    const employer = await Employer.findByPk(job.employer_id);
    if (employer) {
      await Notification.create({
        user_id: employer.user_id,
        title: 'New Application',
        message: `A student has applied for "${job.title}"`,
        type: 'application',
        link: `/employer/applicants/${job.id}`,
      });
    }

    return res.status(201).json({ success: true, message: 'Application submitted', data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: applications } = await Application.findAndCountAll({
      where: { student_id: student.id },
      include: [{
        model: Job,
        as: 'job',
        include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo'] }],
      }],
      order: [['applied_at', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved',
      data: applications,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const job = await Job.findOne({ where: { id: req.params.jobId, employer_id: employer.id } });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    const where = { job_id: job.id };
    if (status) where.status = status;

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
      }],
      order: [['applied_at', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved',
      data: applications,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const job = await Job.findOne({ where: { id: application.job_id, employer_id: employer.id } });
    if (!job) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status, employer_notes } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'reviewed') updates.reviewed_at = new Date();
      if (['accepted', 'rejected'].includes(status)) updates.responded_at = new Date();
    }
    if (employer_notes !== undefined) updates.employer_notes = employer_notes;

    await application.update(updates);

    const student = await Student.findByPk(application.student_id);
    if (student) {
      await Notification.create({
        user_id: student.user_id,
        title: 'Application Update',
        message: `Your application for "${job.title}" has been ${status || 'updated'}`,
        type: 'application',
        link: `/student/applied-jobs`,
      });
    }

    return res.status(200).json({ success: true, message: 'Application updated', data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const job = await Job.findOne({ where: { id: application.job_id, employer_id: employer.id } });
    if (!job) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { interview_date, interview_location } = req.body;
    if (!interview_date || !interview_location) {
      return res.status(400).json({ success: false, message: 'interview_date and interview_location are required' });
    }

    await application.update({
      interview_date,
      interview_location,
      status: 'interview',
      responded_at: new Date(),
    });

    const student = await Student.findByPk(application.student_id);
    if (student) {
      await Notification.create({
        user_id: student.user_id,
        title: 'Interview Scheduled',
        message: `Interview for "${job.title}" on ${new Date(interview_date).toLocaleDateString()} at ${interview_location}`,
        type: 'interview',
        link: `/student/applied-jobs`,
      });
    }

    return res.status(200).json({ success: true, message: 'Interview scheduled', data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const application = await Application.findOne({ where: { id: req.params.id, student_id: student.id } });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (['accepted', 'rejected'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw after decision' });
    }

    const job = await Job.findByPk(application.job_id);
    if (job && job.current_applicants > 0) {
      await job.update({ current_applicants: job.current_applicants - 1 });
    }

    await application.destroy();

    return res.status(200).json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job, as: 'job', include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo', 'company_address'] }] },
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.status(200).json({ success: true, message: 'Application retrieved', data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  scheduleInterview,
  withdrawApplication,
  getApplicationById,
};
