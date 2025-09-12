const Goal = require('../models/Goal');
const Chat = require('../models/Chat');
const CheckinRecord = require('../models/CheckinRecord');
const { Types: { ObjectId } } = require('mongoose');

const getProgress = async (req, res) => {
  try {
    const goalId = req.params.goalId;

    // Validate the ID format
    if (!ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const total = goal.milestones.length || 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    const completion = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Enhanced velocity calculation based on check-in data
    const velocity = await calculateLearningVelocity(goalId, req.user.userId);

    // Generate comprehensive session summary
    const sessionSummary = await generateSessionSummary(goalId, req.user.userId);

    // summary from latest chat assistant messages (last 3)
    const chat = await Chat.findOne({ goalId: goal._id, userId: req.user.userId });
    const assistantNotes = (chat?.messages || [])
      .filter(m => m.role === 'assistant')
      .slice(-3)
      .map(m => m.content);
    const aiInsights = assistantNotes.length
      ? `Latest learnings: ${assistantNotes.join(' | ')}`
      : 'Keep going! Complete milestones and check back for insights.';

    // Optionally persist derived fields
    goal.completedMilestones = completed;
    goal.progressPercent = completion;
    await goal.save();

    // Match the frontend's ProgressResponse interface
    return res.status(200).json({
      completion,
      velocity,
      summary: sessionSummary,
      aiInsights,
      // Ensure we have all required fields with defaults
      progress: completion, // Alias for compatibility
      milestonesCompleted: completed,
      totalMilestones: total,
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error('getProgress error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const calculateLearningVelocity = async (goalId, userId) => {
  try {
    // Get check-in records for this goal
    const checkins = await CheckinRecord.find({ goalId, userId })
      .sort({ checkinDate: 1 });

    if (checkins.length < 2) {
      return "Building momentum...";
    }

    // Calculate progress velocity based on check-in data
    const firstCheckin = checkins[0];
    const lastCheckin = checkins[checkins.length - 1];
    const daysDiff = Math.max(1, (new Date(lastCheckin.checkinDate) - new Date(firstCheckin.checkinDate)) / (1000 * 60 * 60 * 24));

    // Calculate average progress increase per day
    const progressIncrease = lastCheckin.progressUpdate - firstCheckin.progressUpdate;
    const velocityPerDay = progressIncrease / daysDiff;

    if (velocityPerDay > 0) {
      return `+${velocityPerDay.toFixed(1)}% per day`;
    } else if (velocityPerDay < 0) {
      return `${velocityPerDay.toFixed(1)}% per day`;
    } else {
      return "Steady progress";
    }
  } catch (err) {
    console.error('calculateLearningVelocity error', err);
    return "Calculating...";
  }
};

const generateSessionSummary = async (goalId, userId) => {
  try {
    // Get recent check-ins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCheckins = await CheckinRecord.find({
      goalId,
      userId,
      checkinDate: { $gte: sevenDaysAgo }
    }).sort({ checkinDate: -1 });

    if (recentCheckins.length === 0) {
      return "No recent check-ins. Time for a progress update!";
    }

    // Analyze mood patterns
    const moodCounts = {};
    recentCheckins.forEach(checkin => {
      if (checkin.mood) {
        moodCounts[checkin.mood] = (moodCounts[checkin.mood] || 0) + 1;
      }
    });

    const dominantMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b, "neutral"
    );

    // Calculate consistency
    const checkinDays = recentCheckins.length;
    const consistency = Math.round((checkinDays / 7) * 100);

    // Generate summary
    let summary = `This week: ${checkinDays} check-ins (${consistency}% consistency). `;

    if (dominantMood !== "neutral") {
      summary += `Overall mood: ${dominantMood}. `;
    }

    if (consistency >= 70) {
      summary += "Great consistency! Keep it up!";
    } else if (consistency >= 50) {
      summary += "Good progress. Try to check in more regularly.";
    } else {
      summary += "Let's build better habits with more frequent check-ins.";
    }

    return summary;
  } catch (err) {
    console.error('generateSessionSummary error', err);
    return "Unable to generate summary at this time.";
  }
};

const getOverallProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all user's goals
    const goals = await Goal.find({ userId });

    if (goals.length === 0) {
      return res.status(200).json({
        totalGoals: 0,
        completedGoals: 0,
        averageProgress: 0,
        overallVelocity: "No goals yet",
        weeklySummary: "Start by creating your first goal!",
        lastUpdated: new Date().toISOString()
      });
    }

    // Calculate overall statistics
    let totalMilestones = 0;
    let completedMilestones = 0;
    let totalProgress = 0;
    let completedGoals = 0;

    for (const goal of goals) {
      const goalTotal = goal.milestones.length || 0;
      const goalCompleted = goal.milestones.filter(m => m.completed).length;

      totalMilestones += goalTotal;
      completedMilestones += goalCompleted;
      totalProgress += goal.progressPercent || 0;

      if (goalTotal > 0 && goalCompleted === goalTotal) {
        completedGoals++;
      }
    }

    const averageProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;

    // Calculate overall velocity based on recent check-ins
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCheckins = await CheckinRecord.find({
      userId,
      checkinDate: { $gte: thirtyDaysAgo }
    }).sort({ checkinDate: 1 });

    let overallVelocity = "Building momentum...";
    if (recentCheckins.length >= 2) {
      const firstCheckin = recentCheckins[0];
      const lastCheckin = recentCheckins[recentCheckins.length - 1];
      const daysDiff = Math.max(1, (new Date(lastCheckin.checkinDate) - new Date(firstCheckin.checkinDate)) / (1000 * 60 * 60 * 24));

      const progressIncrease = lastCheckin.progressUpdate - firstCheckin.progressUpdate;
      const velocityPerDay = progressIncrease / daysDiff;

      if (velocityPerDay > 0) {
        overallVelocity = `+${velocityPerDay.toFixed(1)}% per day`;
      } else if (velocityPerDay < 0) {
        overallVelocity = `${velocityPerDay.toFixed(1)}% per day`;
      } else {
        overallVelocity = "Steady progress";
      }
    }

    // Generate weekly summary
    const weeklySummary = await generateWeeklySummary(userId);

    return res.status(200).json({
      totalGoals: goals.length,
      completedGoals,
      averageProgress,
      overallVelocity,
      weeklySummary,
      totalMilestones,
      completedMilestones,
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error('getOverallProgress error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const generateWeeklySummary = async (userId) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCheckins = await CheckinRecord.find({
      userId,
      checkinDate: { $gte: sevenDaysAgo }
    });

    if (recentCheckins.length === 0) {
      return "No check-ins this week. Let's get started!";
    }

    const uniqueDays = new Set(
      recentCheckins.map(c => new Date(c.checkinDate).toDateString())
    ).size;

    const avgMood = recentCheckins
      .filter(c => c.mood)
      .map(c => {
        const moodScores = { great: 5, good: 4, okay: 3, struggling: 2 };
        return moodScores[c.mood] || 3;
      });

    const avgMoodScore = avgMood.length > 0
      ? avgMood.reduce((a, b) => a + b, 0) / avgMood.length
      : 3;

    let moodText = "mixed feelings";
    if (avgMoodScore >= 4.5) moodText = "excellent";
    else if (avgMoodScore >= 3.5) moodText = "good";
    else if (avgMoodScore >= 2.5) moodText = "okay";

    return `Active ${uniqueDays} days this week with ${moodText} overall mood. ${recentCheckins.length} total check-ins recorded.`;
  } catch (err) {
    console.error('generateWeeklySummary error', err);
    return "Weekly summary unavailable.";
  }
};

module.exports = { getProgress, getOverallProgress };


