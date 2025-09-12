const CheckinConfig = require('../models/CheckinConfig');
const CheckinRecord = require('../models/CheckinRecord');
const { calculateNextCheckin } = require('../utils/checkin.utils');
const { Types: { ObjectId } } = require('mongoose');

// Get user's check-in configuration
const getCheckinConfig = async (req, res) => {
  try {
    const userId = req.user.userId;
    let config = await CheckinConfig.findOne({ userId });

    if (!config) {
      // Create a default config if none exists
      config = await CheckinConfig.create({ userId });
    }

    return res.status(200).json(config);
  } catch (err) {
    console.error('getCheckinConfig error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user's check-in configuration
const updateCheckinConfig = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { interval, time, remindersEnabled } = req.body;

    if (!interval || !time) {
      return res.status(400).json({ message: 'Interval and time are required' });
    }

    let config = await CheckinConfig.findOne({ userId });

    if (!config) {
      config = await CheckinConfig.create({ userId, interval, time, remindersEnabled });
    } else {
      config.interval = interval;
      config.time = time;
      config.remindersEnabled = remindersEnabled !== undefined ? remindersEnabled : config.remindersEnabled;
      // Recalculate next check-in date if interval or time changes
      config.nextCheckin = calculateNextCheckin(interval, config.lastCheckin, time);
      await config.save();
    }

    return res.status(200).json(config);
  } catch (err) {
    console.error('updateCheckinConfig error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Record a new check-in
const recordCheckin = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, mood, notes, progressUpdate } = req.body;

    if (!goalId) {
      return res.status(400).json({ message: 'Goal ID is required' });
    }
    if (!ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }

    const checkin = await CheckinRecord.create({
      userId,
      goalId,
      mood,
      notes,
      progressUpdate,
      checkinDate: new Date(),
    });

    // Update lastCheckin and nextCheckin in CheckinConfig
    const config = await CheckinConfig.findOne({ userId });
    if (config) {
      config.lastCheckin = checkin.checkinDate;
      config.nextCheckin = calculateNextCheckin(config.interval, config.lastCheckin, config.time);
      await config.save();
    }

    return res.status(201).json(checkin);
  } catch (err) {
    console.error('recordCheckin error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get check-in history for a specific goal
const getCheckinHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goalId = req.params.goalId;

    if (!ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID format' });
    }

    const history = await CheckinRecord.find({ userId, goalId }).sort({ checkinDate: -1 });

    return res.status(200).json(history);
  } catch (err) {
    console.error('getCheckinHistory error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all check-in records for the user (for calendar display)
const getAllCheckinRecords = async (req, res) => {
  try {
    const userId = req.user.userId;

    const records = await CheckinRecord.find({ userId })
      .populate('goalId', 'title')
      .sort({ checkinDate: -1 });

    return res.status(200).json(records);
  } catch (err) {
    console.error('getAllCheckinRecords error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCheckinConfig,
  updateCheckinConfig,
  recordCheckin,
  getCheckinHistory,
  getAllCheckinRecords,
};