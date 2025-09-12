const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will be limited.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateAIResponse = async (goal, chatHistory, userMessage, type = 'chat') => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return `Dev mode reply: To enable AI, set GEMINI_API_KEY. For now, here are next steps for goal "${goal.title}": 1) Break tasks into weekly milestones, 2) Schedule daily study, 3) Review progress each week.`;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let systemContext = `You are an AI tutor helping a user with their goal titled "${goal.title}".`;
  if (goal.description) {
    systemContext += ` The goal is: "${goal.description}".`;
  }
  if (goal.milestones && goal.milestones.length > 0) {
    const completedMilestones = goal.milestones.filter(m => m.completed).map(m => m.objective);
    const pendingMilestones = goal.milestones.filter(m => !m.completed).map(m => m.objective);
    if (completedMilestones.length > 0) {
      systemContext += ` The user has completed these milestones: ${completedMilestones.join(', ')}.`;
    }
    if (pendingMilestones.length > 0) {
      systemContext += ` The user still needs to complete these milestones: ${pendingMilestones.join(', ')}.`;
    }
  }

  let fullPrompt = `${systemContext}\n\n`;

  // Add recent chat history for context
  if (chatHistory && chatHistory.messages && chatHistory.messages.length > 0) {
    const recentMessages = chatHistory.messages.slice(-5); // Get last 5 messages for context
    recentMessages.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
  }

  fullPrompt += `User: ${userMessage}\n`;

  switch (type) {
    case 'learning_module':
      fullPrompt += `Please provide a brief overview or suggest resources for a learning module related to "${userMessage}" within the context of the user's goal.`;
      break;
    case 'practice_problem':
      fullPrompt += `Please generate a practice problem or a small task related to "${userMessage}" within the context of the user's goal. Provide a clear problem statement and expected outcome.`;
      break;
    case 'chat':
    default:
      fullPrompt += `Provide a concise, actionable response to the user's query.`;
      break;
  }

  try {
    const result = await model.generateContent(fullPrompt);
    return result?.response?.text?.() || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating AI content:', error);
    return 'Sorry, I encountered an error while generating a response.';
  }
};

module.exports = { generateAIResponse };