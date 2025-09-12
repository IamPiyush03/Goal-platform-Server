const Goal = require('../models/Goal');
const Chat = require('../models/Chat');
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

    // crude velocity: completed per week of timeline
    const weeks = Math.max(1, Math.round((goal.milestones[goal.milestones.length - 1]?.week) || 1));
    const velocity = `${(completed / weeks).toFixed(2)} milestones/week`;

    // summary from latest chat assistant messages (last 3)
    const chat = await Chat.findOne({ goalId: goal._id, userId: req.user.userId });
    const assistantNotes = (chat?.messages || [])
      .filter(m => m.role === 'assistant')
      .slice(-3)
      .map(m => m.content);
    const summary = assistantNotes.length
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
      summary,
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

module.exports = { getProgress };


