const nodemailer = require('nodemailer');

// Create transporter (using Gmail as example - in production, use a service like SendGrid)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Goal Achievement Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Goal Achievement Platform!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - Goal Achievement Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

const sendCheckinReminder = async (email, goalTitle, daysSinceLastCheckin) => {
  const subject = `Time for a check-in on "${goalTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Check-in Reminder</h2>
      <p>It's been ${daysSinceLastCheckin} days since your last check-in for:</p>
      <h3 style="color: #3b82f6;">${goalTitle}</h3>
      <p>Regular check-ins help you stay on track and maintain momentum toward your goals.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard"
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Record Check-in
        </a>
      </div>
      <p>You can always adjust your reminder preferences in your settings.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
    console.log('Check-in reminder sent to:', email);
  } catch (error) {
    console.error('Error sending check-in reminder:', error);
    throw new Error('Failed to send check-in reminder');
  }
};

const sendWeeklyProgressSummary = async (email, stats) => {
  const subject = `Your Weekly Progress Summary`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Weekly Progress Summary</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">This Week:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>📊 <strong>${stats.totalGoals}</strong> active goals</li>
          <li>✅ <strong>${stats.completedGoals}</strong> goals completed</li>
          <li>📈 <strong>${stats.averageProgress}%</strong> average progress</li>
          <li>⚡ <strong>${stats.overallVelocity}</strong> learning velocity</li>
        </ul>
      </div>
      <p>${stats.weeklySummary}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard"
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Full Progress
        </a>
      </div>
      <p>Keep up the great work! 💪</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
    console.log('Weekly progress summary sent to:', email);
  } catch (error) {
    console.error('Error sending weekly summary:', error);
    throw new Error('Failed to send weekly summary');
  }
};

const sendGoalCompletionNotification = async (email, goalTitle) => {
  const subject = `🎉 Congratulations! Goal Completed: ${goalTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎉 Goal Completed!</h2>
      <p>Congratulations on completing:</p>
      <h3 style="color: #3b82f6; text-align: center; padding: 20px; background-color: #f0f9ff; border-radius: 8px;">
        ${goalTitle}
      </h3>
      <p>You've achieved something amazing! Take a moment to celebrate your success.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard"
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Set New Goals
        </a>
      </div>
      <p>What's your next achievement going to be?</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });
    console.log('Goal completion notification sent to:', email);
  } catch (error) {
    console.error('Error sending goal completion notification:', error);
    throw new Error('Failed to send goal completion notification');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendCheckinReminder,
  sendWeeklyProgressSummary,
  sendGoalCompletionNotification
};