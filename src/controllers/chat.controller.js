const Chat = require('../models/Chat');
const Goal = require('../models/Goal');
const { generateAIResponse } = require('../utils/ai.utils');

const chat = async (req, res) => {
  try {
    const { goalId, message, type } = req.body; // Added 'type' for different AI interactions
    if (!goalId || !message) {
      return res.status(400).json({ message: 'goalId and message are required' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId }).select('title description milestones'); // Select milestones for context
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const chatHistory = await Chat.findOne({ goalId, userId: req.user.userId });

    const reply = await generateAIResponse(goal, chatHistory, message, type);

    // Store conversation history
    await Chat.findOneAndUpdate(
      { goalId, userId: req.user.userId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: message, timestamp: new Date() },
              { role: 'assistant', content: reply, timestamp: new Date() },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('chat error', err);
    return res.status(500).json({ message: 'Failed to generate response' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { goalId } = req.params;
    if (!goalId) {
      return res.status(400).json({ message: 'goalId is required' });
    }

    const chatHistory = await Chat.findOne({ goalId, userId: req.user.userId });
    if (!chatHistory) {
      return res.status(200).json({ messages: [] });
    }

    return res.status(200).json({ messages: chatHistory.messages });
  } catch (err) {
    console.error('get chat history error', err);
    return res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

module.exports = { chat, getChatHistory };


