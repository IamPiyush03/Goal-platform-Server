const Goal = require('../models/Goal');
const { parseTimeline, generateMilestones } = require('../utils.milestones');

const createGoal = async (req, res) => {
  try {
    const { title, description, timeline } = req.body;
    if (!title || !timeline) {
      return res.status(400).json({ message: 'title and timeline are required' });
    }
    const weeks = parseTimeline(timeline);
    const milestones = generateMilestones(title, weeks);
    const goal = await Goal.create({
      title,
      description,
      timeline,
      milestones,
      progress: 0,
      userId: req.user.userId,
    });
    // Return goalId and milestones as expected by the frontend
    return res.status(201).json({
      goalId: goal._id.toString(),
      milestones: goal.milestones,
    });
  } catch (err) {
    console.error('createGoal error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const listGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.userId }).select('title progress createdAt');
    const transformedGoals = goals.map(goal => ({
      id: goal._id.toString(),
      title: goal.title,
      progress: goal.progress || 0,
      createdAt: goal.createdAt, // Include createdAt if needed for sorting or display
    }));
    return res.status(200).json(transformedGoals);
  } catch (err) {
    console.error('listGoals error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const { Types: { ObjectId } } = require('mongoose');

const getGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    
    // Validate the ID format
    if (!ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }
    
    const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    // Transform the goal to match the frontend's expected format
    const transformedGoal = {
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      timeline: goal.timeline,
      progress: goal.progress || 0,
      milestones: goal.milestones || []
    };
    
    return res.status(200).json(transformedGoal);
  } catch (err) {
    console.error('getGoal error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { title, description, timeline, milestones, progress } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (timeline !== undefined) update.timeline = timeline;
    if (milestones !== undefined) update.milestones = milestones;
    if (progress !== undefined) update.progress = progress;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: update },
      { new: true }
    );

    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    return res.status(200).json(goal);
  } catch (err) {
    console.error('updateGoal error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    return res.status(200).json({ message: 'Goal deleted' });
  } catch (err) {
    console.error('deleteGoal error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const toggleMilestone = async (req, res) => {
  try {
    const goalId = req.params.id;
    const { week, completed } = req.body;

    if (!ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const milestoneIndex = goal.milestones.findIndex(m => m.week === week);
    if (milestoneIndex === -1) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    goal.milestones[milestoneIndex].completed = completed;

    // Recalculate progress
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    goal.progress = (completedMilestones / goal.milestones.length) * 100;

    await goal.save();

    // Transform the goal to match the frontend's expected format
    const transformedGoal = {
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      timeline: goal.timeline,
      progress: goal.progress || 0,
      milestones: goal.milestones || []
    };

    return res.status(200).json(transformedGoal);
  } catch (err) {
    console.error('toggleMilestone error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createGoal, listGoals, getGoal, updateGoal, deleteGoal, toggleMilestone };


