const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email.utils');

const validateEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      email,
      passwordHash,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails, but log it
    }

    return res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.'
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res.status(200).json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Request password reset error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { signup, login, verifyEmail, resendVerification, requestPasswordReset, resetPassword };
