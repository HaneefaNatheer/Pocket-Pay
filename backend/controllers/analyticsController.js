const { Op, fn, col } = require('sequelize');
const User = require('../models/User');
const Student = require('../models/Student');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Review = require('../models/Review');

const getMonthlyRegistrations = async (start) => {
  const users = await User.findAll({
    attributes: ['id', 'role', 'createdAt'],
    where: { createdAt: { [Op.gte]: start } },
  });

  const map = new Map();
  users.forEach((u) => {
    const month = u.createdAt.toISOString().slice(0, 7);
    if (!map.has(month)) map.set(month, { month, students: 0, employers: 0 });
    const entry = map.get(month);
    if (u.role === 'student') entry.students += 1;
    else if (u.role === 'employer') entry.employers += 1;
  });

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
};

const calculateMonthlyGrowth = (monthly) => {
  if (!monthly || monthly.length < 2) return 0;
  const prev = monthly[monthly.length - 2];
  const last = monthly[monthly.length - 1];
  const prevTotal = (prev.students || 0) + (prev.employers || 0);
  const lastTotal = (last.students || 0) + (last.employers || 0);
  if (prevTotal === 0) return lastTotal > 0 ? 100 : 0;
  return Math.round(((lastTotal - prevTotal) / prevTotal) * 100);
};

const getTopEmployersData = async (limit = 5) => {
  const employers = await Employer.findAll({
    attributes: ['id', 'company_name', 'company_logo', 'total_jobs_posted', 'is_verified'],
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    order: [['total_jobs_posted', 'DESC']],
    limit,
  });

  const employerIds = employers.map((e) => e.id);
  let ratingsMap = new Map();
  if (employerIds.length > 0) {
    const ratings = await Review.findAll({
      attributes: ['employer_id', [fn('AVG', col('rating')), 'avg']],
      where: { employer_id: { [Op.in]: employerIds }, is_visible: true },
      group: ['employer_id'],
      raw: true,
    });
    ratings.forEach((r) => ratingsMap.set(r.employer_id, parseFloat(r.avg) || 0));
  }

  return employers.map((e) => ({
    id: e.id,
    companyName: e.company_name,
    companyLogo: e.company_logo,
    jobsPosted: e.total_jobs_posted || 0,
    isVerified: e.is_verified,
    averageRating: ratingsMap.get(e.id) || 0,
  }));
};

const getOverview = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalStudents, totalEmployers, totalJobs, totalApplications, activeUsers, monthlyRegistrations, jobsByCategory, applicationStatusDistribution, topEmployers] = await Promise.all([
      Student.count(),
      Employer.count(),
      Job.count(),
      Application.count(),
      User.count({ where: { last_login: { [Op.gte]: thirtyDaysAgo }, is_active: true } }),
      getMonthlyRegistrations(twelveMonthsAgo),
      Job.findAll({
        attributes: ['category', [fn('COUNT', col('id')), 'count']],
        where: { status: 'active' },
        group: ['category'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        raw: true,
      }),
      Application.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        raw: true,
      }),
      getTopEmployersData(),
    ]);

    const monthlyGrowth = calculateMonthlyGrowth(monthlyRegistrations);

    return res.status(200).json({
      success: true,
      message: 'Overview retrieved',
      data: {
        totalStudents,
        totalEmployers,
        totalJobs,
        totalApplications,
        activeUsers,
        monthlyGrowth,
        monthlyRegistrations,
        jobsByCategory,
        applicationStatusDistribution,
        topEmployers,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyGrowth = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRegistrations = await getMonthlyRegistrations(twelveMonthsAgo);
    const monthlyGrowth = calculateMonthlyGrowth(monthlyRegistrations);

    return res.status(200).json({
      success: true,
      message: 'Monthly growth retrieved',
      data: { monthlyGrowth, monthlyRegistrations },
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
