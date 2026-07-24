const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../models/User');
const Student = require('../models/Student');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getOverview = async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalEmployers = await Employer.count();
    const totalJobs = await Job.count();
    const totalApplications = await Application.count();

    return res.status(200).json({
      success: true,
      message: 'Overview retrieved',
      data: { totalStudents, totalEmployers, totalJobs, totalApplications },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyGrowth = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await User.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Monthly growth retrieved',
      data: monthlyData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJobCategoryStats = async (req, res) => {
  try {
    const stats = await Job.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      where: { status: 'active' },
      group: ['category'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Job category stats retrieved',
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Application stats retrieved',
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveUsers = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.count({
      where: {
        last_login: { [Op.gte]: thirtyDaysAgo },
        is_active: true,
      },
    });

    const totalUsers = await User.count({ where: { is_active: true } });

    return res.status(200).json({
      success: true,
      message: 'Active users retrieved',
      data: { activeUsers, totalUsers, percentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTopEmployers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topEmployers = await Employer.findAll({
      attributes: ['id', 'company_name', 'company_logo', 'total_jobs_posted', 'is_verified'],
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['total_jobs_posted', 'DESC']],
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Top employers retrieved',
      data: topEmployers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const byUniversity = await Student.findAll({
      attributes: ['university', [fn('COUNT', col('Student.id')), 'count']],
      where: { university: { [Op.ne]: null } },
      group: ['university'],
      order: [[fn('COUNT', col('Student.id')), 'DESC']],
      raw: true,
    });

    const byDegree = await Student.findAll({
      attributes: ['degree', [fn('COUNT', col('Student.id')), 'count']],
      where: { degree: { [Op.ne]: null } },
      group: ['degree'],
      order: [[fn('COUNT', col('Student.id')), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Student stats retrieved',
      data: { byUniversity, byDegree },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOverview,
  getMonthlyGrowth,
  getJobCategoryStats,
  getApplicationStats,
  getActiveUsers,
  getTopEmployers,
  getStudentStats,
};
