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
        [sequelize.literal("strftime('%Y-%m', created_at)"), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [sequelize.literal("strftime('%Y-%m', created_at)")],
      order: [sequelize.literal("strftime('%Y-%m', created_at) ASC")],
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

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.destroy();

    if (student.user) {
      await student.user.destroy();
    }

    return res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }

    await employer.destroy();

    if (employer.user) {
      await employer.user.destroy();
    }

    return res.status(200).json({ success: true, message: 'Employer deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const exportData = async (req, res) => {
  try {
    const { type } = req.params;
    const esc = (v) => (v != null ? `"${String(v).replace(/"/g, '""')}"` : '');
    let csv = '';
    let filename = '';

    switch (type) {
      case 'students': {
        const students = await Student.findAll({
          include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
          order: [['createdAt', 'DESC']],
        });
        csv = 'ID,Name,Email,Phone,University,Degree,Year of Study,NIC,Address,Status,Joined\n';
        students.forEach((s) => {
          const u = s.user || {};
          csv += `${s.id},${esc(u.name)},${esc(u.email)},${esc(u.phone)},${esc(s.university)},${esc(s.degree)},${s.year_of_study || ''},${esc(s.nic)},${esc(s.address)},${u.is_active ? 'Active' : 'Blocked'},${s.createdAt || ''}\n`;
        });
        filename = 'students.csv';
        break;
      }
      case 'employers': {
        const employers = await Employer.findAll({
          include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
          order: [['createdAt', 'DESC']],
        });
        csv = 'ID,Company Name,Contact Name,Email,Phone,Industry,Website,Verified,Status,Joined\n';
        employers.forEach((e) => {
          const u = e.user || {};
          csv += `${e.id},${esc(e.company_name)},${esc(u.name)},${esc(u.email)},${esc(u.phone)},${esc(e.industry)},${esc(e.website)},${e.is_verified ? 'Yes' : 'No'},${u.is_active ? 'Active' : 'Blocked'},${e.createdAt || ''}\n`;
        });
        filename = 'employers.csv';
        break;
      }
      case 'report-daily': {
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date();
        end.setUTCHours(23, 59, 59, 999);
        const newUsers = await User.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newStudents = await Student.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newEmployers = await Employer.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newJobs = await Job.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newApplications = await Application.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        csv = 'Report Type,Date,New Users,New Students,New Employers,New Jobs,New Applications\n';
        csv += `Daily,${start.toISOString().slice(0, 10)},${newUsers},${newStudents},${newEmployers},${newJobs},${newApplications}\n`;
        filename = 'daily-report.csv';
        break;
      }
      case 'report-monthly': {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
        const newUsers = await User.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newStudents = await Student.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newEmployers = await Employer.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newJobs = await Job.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newApplications = await Application.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        csv = 'Report Type,Month,Year,New Users,New Students,New Employers,New Jobs,New Applications\n';
        csv += `Monthly,${now.getUTCMonth() + 1},${now.getUTCFullYear()},${newUsers},${newStudents},${newEmployers},${newJobs},${newApplications}\n`;
        filename = 'monthly-report.csv';
        break;
      }
      case 'report-yearly': {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
        const newUsers = await User.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newStudents = await Student.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newEmployers = await Employer.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newJobs = await Job.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        const newApplications = await Application.count({ where: { createdAt: { [Op.between]: [start, end] } } });
        csv = 'Report Type,Year,New Users,New Students,New Employers,New Jobs,New Applications\n';
        csv += `Yearly,${now.getFullYear()},${newUsers},${newStudents},${newEmployers},${newJobs},${newApplications}\n`;
        filename = 'yearly-report.csv';
        break;
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
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
  deleteStudent,
  deleteEmployer,
  exportData,
  getSystemLogs,
};
