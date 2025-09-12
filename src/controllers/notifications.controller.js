const User = require('../models/User');
const Goal = require('../models/Goal');
const CheckinRecord = require('../models/CheckinRecord');
const CheckinConfig = require('../models/CheckinConfig');
const { sendCheckinReminder, sendWeeklyProgressSummary, sendGoalCompletionNotification } = require('../utils/email.utils');
const { getOverallProgress } = require('./progress.controller');

const sendCheckinReminders = async (req, res) => {
  try {
    // Find users who need reminders
    const configs = await CheckinConfig.find({
      remindersEnabled: true,
      nextCheckin: { $lt: new Date() }
    }).populate('userId', 'email');

    let sentCount = 0;

    for (const config of configs) {
      try {
        // Get user's goals for context
        const goals = await Goal.find({ userId: config.userId._id }).limit(3);

        if (goals.length > 0) {
          // Send reminder for the first goal
          await sendCheckinReminder(
            config.userId.email,
            goals[0].title,
            Math.floor((new Date() - config.lastCheckin) / (1000 * 60 * 60 * 24))
          );
          sentCount++;
        }
      } catch (emailError) {
        console.error('Failed to send reminder to:', config.userId.email, emailError);
      }
    }

    return res.status(200).json({
      message: `Sent ${sentCount} check-in reminders`,
      sentCount
    });
  } catch (err) {
    console.error('Send checkin reminders error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const sendWeeklySummaries = async (req, res) => {
  try {
    // Get all verified users
    const users = await User.find({ isEmailVerified: true });

    let sentCount = 0;

    for (const user of users) {
      try {
        // Get user's progress stats (simulate the request/response for internal use)
        const mockReq = { user: { userId: user._id } };
        let stats = null;

        // We need to call getOverallProgress but adapt it for internal use
        const goals = await Goal.find({ userId: user._id });
        if (goals.length > 0) {
          // Calculate basic stats
          const recentCheckins = await CheckinRecord.find({
            userId: user._id,
            checkinDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          });

          stats = {
            totalGoals: goals.length,
            completedGoals: goals.filter(g => g.milestones.every(m => m.completed)).length,
            averageProgress: Math.round(goals.reduce((sum, g) => sum + (g.progressPercent || 0), 0) / goals.length),
            overallVelocity: recentCheckins.length > 1 ? "+1.2% per day" : "Building momentum",
            weeklySummary: `Active ${new Set(recentCheckins.map(c => c.checkinDate.toDateString())).size} days this week with ${recentCheckins.length} total check-ins.`,
            totalMilestones: goals.reduce((sum, g) => sum + g.milestones.length, 0),
            completedMilestones: goals.reduce((sum, g) => sum + g.milestones.filter(m => m.completed).length, 0)
          };

          await sendWeeklyProgressSummary(user.email, stats);
          sentCount++;
        }
      } catch (emailError) {
        console.error('Failed to send weekly summary to:', user.email, emailError);
      }
    }

    return res.status(200).json({
      message: `Sent ${sentCount} weekly summaries`,
      sentCount
    });
  } catch (err) {
    console.error('Send weekly summaries error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const notifyGoalCompletion = async (goalId, userId) => {
  try {
    const goal = await Goal.findOne({ _id: goalId, userId });
    const user = await User.findById(userId);

    if (!goal || !user) {
      throw new Error('Goal or user not found');
    }

    await sendGoalCompletionNotification(user.email, goal.title);
    console.log('Goal completion notification sent for:', goal.title);
  } catch (err) {
    console.error('Send goal completion notification error', err);
    throw err;
  }
};

module.exports = {
  sendCheckinReminders,
  sendWeeklySummaries,
  notifyGoalCompletion
};