const { GoogleGenerativeAI } = require('@google/generative-ai');

function parseTimeline(timeline) {
  // Accept values like '3 months', '12 weeks', '90 days'
  const lower = String(timeline || '').trim().toLowerCase();
  const match = lower.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (['day', 'days'].includes(unit)) return Math.max(1, Math.round(value / 7));
  if (['week', 'weeks'].includes(unit)) return value;
  if (['month', 'months'].includes(unit)) return value * 4; // approx 4 weeks per month
  return 0;
}

async function generateMilestones(title, weeks, description = '') {
  const count = Math.max(1, weeks || 1);

  // If AI is not available, fall back to generic milestones
  const genAI = getGeminiClient();
  if (!genAI) {
    console.warn('AI not available for milestone generation, using generic milestones');
    return generateGenericMilestones(title, count);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate ${count} specific, actionable milestone objectives for the goal: "${title}".
${description ? `Goal description: ${description}` : ''}

Requirements:
- Each milestone should be specific and measurable
- Milestones should build progressively on each other
- Use action-oriented language
- Keep each milestone concise (under 50 characters)
- Make them relevant to the specific goal topic
- Return only the milestone names, one per line, no numbering

Example format for "Learn React":
Week 1: Set up development environment
Week 2: Learn JSX and components
Week 3: Master state management
Week 4: Build first React application

Generate milestones for: ${title}`;

    const result = await model.generateContent(prompt);
    const response = result?.response?.text?.() || '';

    // Parse the response and create milestones
    const lines = response.split('\n').filter(line => line.trim());
    const milestones = [];

    for (let i = 0; i < count; i++) {
      let objective = `Week ${i + 1}: Complete milestone ${i + 1}`;

      if (lines[i]) {
        // Clean up the line (remove any numbering or prefixes)
        const cleanLine = lines[i]
          .replace(/^\d+\.?\s*/, '') // Remove numbering like "1.", "1)"
          .replace(/^Week \d+:\s*/i, '') // Remove "Week X:" prefix if present
          .trim();

        if (cleanLine) {
          objective = `Week ${i + 1}: ${cleanLine}`;
        }
      }

      milestones.push({
        week: i + 1,
        objective: objective,
        completed: false,
      });
    }

    return milestones;

  } catch (error) {
    console.error('Error generating AI milestones:', error);
    // Fall back to generic milestones on error
    return generateGenericMilestones(title, count);
  }
}

function generateGenericMilestones(title, count) {
  const objectives = [
    'Plan and outline your approach',
    'Research and gather resources',
    'Learn fundamental concepts',
    'Practice basic skills',
    'Deep dive into core topics',
    'Start building projects',
    'Review and iterate',
    'Midpoint assessment',
    'Advanced topic exploration',
    'Build comprehensive project',
    'Final review and testing',
    'Complete and present work',
  ];

  return Array.from({ length: count }, (_, i) => ({
    week: i + 1,
    objective: `Week ${i + 1}: ${objectives[i % objectives.length]}`,
    completed: false,
  }));
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

module.exports = { parseTimeline, generateMilestones };
