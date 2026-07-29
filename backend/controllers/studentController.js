const User = require('../models/User');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Skill = require('../models/Skill');
const UserSkill = require('../models/UserSkill');
const Job = require('../models/Job');
const Employer = require('../models/Employer');

const getProfile = async (req, res) => {
  try {
    let student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
    });

    if (!student) {
      student = await Student.create({
        user_id: req.user.id,
        nic: null,
        permanent_address: null,
        current_address: null,
        address: null,
        university: null,
        degree: null,
        year_of_study: null,
        date_of_birth: null,
      });

      student = await Student.findOne({
        where: { user_id: req.user.id },
        include: [{ model: User, as: 'user', attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] } }],
      });
    }

    return res.status(200).json({ success: true, message: 'Profile retrieved', data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const allowedFields = ['university', 'degree', 'year_of_study', 'address', 'permanent_address', 'current_address', 'nic', 'bio', 'preferred_salary_min', 'preferred_salary_max', 'preferred_location', 'date_of_birth', 'latitude', 'longitude'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await student.update(updates);

    if (req.body.name !== undefined || req.body.phone !== undefined) {
      const userUpdates = {};
      if (req.body.name !== undefined) userUpdates.name = req.body.name;
      if (req.body.phone !== undefined) userUpdates.phone = req.body.phone;
      await User.update(userUpdates, { where: { id: req.user.id } });
    }

    return res.status(200).json({ success: true, message: 'Profile updated', data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    console.log('[UPLOAD] req.file:', req.file);
    console.log('[UPLOAD] req.user:', req.user);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = `uploads/profiles/${req.file.filename}`;
    console.log('[UPLOAD] Saving filePath:', filePath, 'for user id:', req.user.id);
    const [updated] = await User.update({ profile_picture: filePath }, { where: { id: req.user.id } });
    console.log('[UPLOAD] Rows updated:', updated);

    return res.status(200).json({ success: true, message: 'Profile picture uploaded', data: { profile_picture: filePath } });
  } catch (error) {
    console.error('[UPLOAD] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const filePath = `uploads/cv/${req.file.filename}`;
    await student.update({ cv_file: filePath });

    return res.status(200).json({ success: true, message: 'CV uploaded', data: { cv_file: filePath } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { day_of_week, start_time, end_time, is_busy, subject } = req.body;

    const entry = await Timetable.create({
      student_id: student.id,
      day_of_week,
      start_time,
      end_time,
      is_busy: is_busy !== undefined ? is_busy : true,
      subject,
    });

    return res.status(201).json({ success: true, message: 'Timetable entry added', data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const timetable = await Timetable.findAll({
      where: { student_id: student.id },
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']],
    });

    return res.status(200).json({ success: true, message: 'Timetable retrieved', data: timetable });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const entry = await Timetable.findOne({ where: { id: req.params.id, student_id: student.id } });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    const allowedFields = ['day_of_week', 'start_time', 'end_time', 'is_busy', 'subject'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await entry.update(updates);

    return res.status(200).json({ success: true, message: 'Timetable entry updated', data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const entry = await Timetable.findOne({ where: { id: req.params.id, student_id: student.id } });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    await entry.destroy();

    return res.status(200).json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addSkill = async (req, res) => {
  try {
    const { skill_name, proficiency, category } = req.body;

    let skill = await Skill.findOne({ where: { name: skill_name } });
    if (!skill) {
      skill = await Skill.create({ name: skill_name, category: category || null });
    }

    const existing = await UserSkill.findOne({ where: { user_id: req.user.id, skill_id: skill.id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Skill already added' });
    }

    const userSkill = await UserSkill.create({
      user_id: req.user.id,
      skill_id: skill.id,
      proficiency: proficiency || 'beginner',
    });

    return res.status(201).json({ success: true, message: 'Skill added', data: userSkill });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeSkill = async (req, res) => {
  try {
    const userSkill = await UserSkill.findOne({ where: { id: req.params.skillId, user_id: req.user.id } });
    if (!userSkill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await userSkill.destroy();

    return res.status(200).json({ success: true, message: 'Skill removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const userSkills = await UserSkill.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Skill, as: 'skill' }],
    });

    return res.status(200).json({ success: true, message: 'Skills retrieved', data: userSkills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getRecommendedJobs = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const userSkills = await UserSkill.findAll({ where: { user_id: req.user.id }, include: [{ model: Skill, as: 'skill' }] });
    const skillNames = userSkills.map((us) => us.skill.name);

    const timetable = await Timetable.findAll({ where: { student_id: student.id, is_busy: false } });
    const freeDays = [...new Set(timetable.map((t) => t.day_of_week))];

    const where = { status: 'active' };

    const { Op } = require('sequelize');
    const orConditions = [];
    if (skillNames.length > 0) {
      orConditions.push({ required_skills: { [Op.ne]: null } });
    }
    if (freeDays.length > 0) {
      orConditions.push({ available_days: { [Op.ne]: null } });
    }

    const jobs = await Job.findAll({
      where,
      include: [{ model: Employer, as: 'employer', attributes: ['id', 'company_name', 'company_logo', 'company_address'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    const scoredJobs = jobs.map((job) => {
      let score = 0;
      const jobSkills = job.required_skills || [];
      if (Array.isArray(jobSkills)) {
        const matchCount = jobSkills.filter((s) => skillNames.includes(s)).length;
        score += matchCount * 10;
      }

      const jobDays = job.available_days || [];
      if (Array.isArray(jobDays)) {
        const dayMatch = jobDays.filter((d) => freeDays.includes(d)).length;
        score += dayMatch * 5;
      }

      return { job: job.toJSON(), score };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      success: true,
      message: 'Recommended jobs retrieved',
      data: scoredJobs.filter((sj) => sj.score > 0).map((sj) => sj.job),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCV,
  addTimetable,
  getTimetable,
  updateTimetable,
  deleteTimetable,
  addSkill,
  removeSkill,
  getSkills,
  getRecommendedJobs,
};
