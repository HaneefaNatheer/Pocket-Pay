const { Op } = require('sequelize');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const User = require('../models/User');
const SavedJob = require('../models/SavedJob');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category, salary_min, salary_max, location, search, job_type, sort } = req.query;

    const where = { status: 'active' };

    if (category) where.category = category;
    if (job_type) where.job_type = job_type;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (salary_min) where.salary_min = { [Op.gte]: salary_min };
    if (salary_max) where.salary_max = { [Op.lte]: salary_max };
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'salary_high') order = [['salary_max', 'DESC']];
    else if (sort === 'salary_low') order = [['salary_min', 'ASC']];
    else if (sort === 'deadline') order = [['deadline', 'ASC']];

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo', 'company_address', 'industry'] }],
      order,
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

const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Employer, as: 'employer', attributes: { exclude: ['verification_documents'] } }],
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await job.update({ views_count: job.views_count + 1 });

    return res.status(200).json({ success: true, message: 'Job retrieved', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const job = await Job.create({ ...req.body, employer_id: employer.id });
    await employer.update({ total_jobs_posted: employer.total_jobs_posted + 1 });

    return res.status(201).json({ success: true, message: 'Job created', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.id } });
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const job = await Job.findOne({ where: { id: req.params.id, employer_id: employer.id } });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or not authorized' });
    }

    const allowedFields = [
      'title', 'description', 'requirements', 'category', 'job_type', 'salary_min',
      'salary_max', 'salary_type', 'location', 'latitude', 'longitude',
      'required_skills', 'available_days', 'available_hours_start', 'available_hours_end',
      'max_applicants', 'deadline', 'status', 'is_urgent',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await job.update(updates);

    return res.status(200).json({ success: true, message: 'Job updated', data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (req.user.role === 'admin') {
      await job.destroy();
    } else {
      const employer = await Employer.findOne({ where: { user_id: req.user.id } });
      if (!employer || job.employer_id !== employer.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      await job.update({ status: 'closed' });
    }

    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { keyword, category, salary_min, salary_max, location, job_type, skills, available_days, sort } = req.query;

    const where = { status: 'active' };

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { requirements: { [Op.like]: `%${keyword}%` } },
      ];
    }
    if (category) where.category = category;
    if (job_type) where.job_type = job_type;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (salary_min) where.salary_min = { [Op.gte]: salary_min };
    if (salary_max) where.salary_max = { [Op.lte]: salary_max };

    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      where.required_skills = { [Op.overlap]: skillArray };
    }

    if (available_days) {
      const daysArray = available_days.split(',').map((d) => d.trim());
      where.available_days = { [Op.overlap]: daysArray };
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'salary_high') order = [['salary_max', 'DESC']];
    else if (sort === 'salary_low') order = [['salary_min', 'ASC']];

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo', 'company_address'] }],
      order,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: 'Jobs found',
      data: jobs,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getJobsByEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByPk(req.params.employerId);
    if (!employer) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
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

const saveJob = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const existing = await SavedJob.findOne({ where: { student_id: student.id, job_id: job.id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Job already saved' });
    }

    const saved = await SavedJob.create({ student_id: student.id, job_id: job.id });

    return res.status(201).json({ success: true, message: 'Job saved', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const unsaveJob = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const saved = await SavedJob.findOne({ where: { student_id: student.id, job_id: req.params.id } });
    if (!saved) {
      return res.status(404).json({ success: false, message: 'Saved job not found' });
    }

    await saved.destroy();

    return res.status(200).json({ success: true, message: 'Job unsaved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const saved = await SavedJob.findAll({
      where: { student_id: student.id },
      include: [{
        model: Job,
        include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo'] }],
      }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ success: true, message: 'Saved jobs retrieved', data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const checkSaved = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const saved = await SavedJob.findOne({ where: { student_id: student.id, job_id: req.params.id } });

    return res.status(200).json({ success: true, message: 'Check complete', data: { saved: !!saved } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJobsByEmployer,
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkSaved,
};
