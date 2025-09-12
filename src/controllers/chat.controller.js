const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const Goal = require('../models/Goal');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const chat = async (req, res) => {
  try {
    const { goalId, message } = req.body;
    if (!goalId || !message) {
      return res.status(400).json({ message: 'goalId and message are required' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId: req.user.userId }).select('title description');
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Stateless prompt with a bit of context
    const systemContext = `You are an AI tutor helping a user with their goal titled "${goal.title}". Provide concise, actionable guidance.`;

    const genAI = getGeminiClient();
    let reply;
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `${systemContext}\n\nUser: ${message}`;
      const result = await model.generateContent(prompt);
      reply = result?.response?.text?.() || 'Sorry, I could not generate a response.';
    } else {
      reply = `Dev mode reply: To enable AI, set GEMINI_API_KEY. For now, here are next steps for goal \"${goal.title}\": 1) Break tasks into weekly milestones, 2) Schedule daily study, 3) Review progress each week.`;
    }

    // Store conversation history (extendable)
    const chatDoc = await Chat.findOneAndUpdate(
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

module.exports = { chat };


