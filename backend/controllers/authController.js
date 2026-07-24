const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Employer = require('../models/Employer');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, company_name, university, degree } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      phone,
      verification_token: verificationToken,
    });

    if (user.role === 'student') {
      await Student.create({
        user_id: user.id,
        university: university || null,
        degree: degree || null,
      });
    } else if (user.role === 'employer') {
      if (!company_name) {
        return res.status(400).json({ success: false, message: 'company_name is required for employers' });
      }
      await Employer.create({
        user_id: user.id,
        company_name,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user.toJSON();

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: userData, token: accessToken, refreshToken },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await user.update({ last_login: new Date() });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user.toJSON();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userData, token: accessToken, refreshToken },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({ reset_token: resetToken, reset_token_expire: resetTokenExpire });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset link has been sent',
      data: { resetLink },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password: newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    const user = await User.findOne({ where: { reset_token: token } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (user.reset_token_expire && new Date(user.reset_token_expire) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, reset_token: null, reset_token_expire: null });

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    await user.update({ is_verified: true, verification_token: null });
    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid or deactivated account' });
    }

    const tokens = generateTokens(user);

    res.cookie('token', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: 'Tokens refreshed',
      data: { token: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verification_token', 'reset_token', 'reset_token_expire'] },
    });

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'employer') {
      profile = await Employer.findOne({ where: { user_id: user.id } });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved',
      data: { ...user.toJSON(), profile },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  getMe,
};
