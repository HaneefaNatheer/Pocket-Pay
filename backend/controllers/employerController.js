const path = require('path');
const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Student = require('../models/Student');

const getProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
    });

    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    return res.status(200).json({ success: true, message: 'Profile retrieved', data: employer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const allowedFields = [
      'company_name', 'contact_person', 'company_description', 'business_registration', 'company_website', 'company_email',
      'company_phone', 'company_address', 'industry', 'company_size',
      'latitude', 'longitude',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.body.phone !== undefined) {
      await User.update({ phone: req.body.phone }, { where: { id: req.user.id } });
    }

    await employer.update(updates);

    return res.status(200).json({ success: true, message: 'Profile updated', data: employer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const filePath = `uploads/logos/${req.file.filename}`;
    await employer.update({ company_logo: filePath });

    return res.status(200).json({ success: true, message: 'Logo uploaded', data: { company_logo: filePath } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const jobs = await Job.findAll({
      where: { employer_id: employer.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ success: true, message: 'Jobs retrieved', data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJobApplicants = async (req, res) => {
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

    const { count, rows: applications } = await Application.findAndCountAll({
      where: { job_id: job.id },
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
      message: 'Applicants retrieved',
      data: applications,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const downloadCV = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const student = await Student.findByPk(req.params.studentId);
    if (!student || !student.cv_file) {
      return res.status(404).json({ success: false, message: 'CV not found' });
    }

    const filePath = path.resolve(student.cv_file);
    return res.download(filePath, (err) => {
      if (err) {
        return res.status(404).json({ success: false, message: 'CV file not found on server' });
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  getMyJobs,
  getJobApplicants,
  downloadCV,
};
