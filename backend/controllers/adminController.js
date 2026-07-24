const { Op } = require('sequelize');
const User = require('../models/User');
const Student = require('../models/Student');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const sequelize = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalEmployers = await Employer.count();
    const totalJobs = await Job.count();
    const totalApplications = await Application.count();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: { totalStudents, totalEmployers, totalJobs, totalApplications, monthlyGrowth: monthlyData },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } },
        { university: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: students } = await Student.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Students retrieved',
      data: students,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllEmployers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } },
        { company_name: { [Op.like]: `%${search}%` } },
        { industry: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: employers } = await Employer.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Employers retrieved',
      data: employers,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByPk(req.params.id);
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    await employer.update({ is_verified: true, verified_at: new Date() });

    await Notification.create({
      user_id: employer.user_id,
      title: 'Employer Verified',
      message: 'Your employer account has been verified',
      type: 'system',
    });

    return res.status(200).json({ success: true, message: 'Employer verified', data: employer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ is_active: false });

    return res.status(200).json({ success: true, message: 'User blocked', data: { id: user.id, is_active: false } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ is_active: true });

    return res.status(200).json({ success: true, message: 'User unblocked', data: { id: user.id, is_active: true } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await job.update({ status: 'closed' });

    return res.status(200).json({ success: true, message: 'Job removed', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Jobs retrieved',
      data: jobs,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: reports } = await Report.findAndCountAll({
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Reports retrieved',
      data: reports,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const { status, admin_notes } = req.body;
    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    await report.update(updates);

    return res.status(200).json({ success: true, message: 'Report updated', data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] },
        { model: Employer, as: 'employer', attributes: ['id', 'company_name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Reviews retrieved',
      data: reviews,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.update({ is_visible: !review.is_visible });

    return res.status(200).json({
      success: true,
      message: 'Review visibility toggled',
      data: { id: review.id, is_visible: review.is_visible },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalEmployers = await Employer.count();
    const totalJobs = await Job.count();
    const totalApplications = await Application.count();
    const totalReports = await Report.count();
    const totalReviews = await Review.count();

    const recentUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const recentJobs = await Job.findAll({
      attributes: ['id', 'title', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      message: 'System logs retrieved',
      data: {
        counts: { totalStudents, totalEmployers, totalJobs, totalApplications, totalReports, totalReviews },
        recentUsers,
        recentJobs,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getAllEmployers,
  verifyEmployer,
  blockUser,
  unblockUser,
  removeJob,
  getAllJobs,
  getAllReports,
  updateReportStatus,
  getAllReviews,
  toggleReviewVisibility,
  getSystemLogs,
};
