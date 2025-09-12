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

function generateMilestones(title, weeks) {
  const objectives = [
    'Plan and outline',
    'Research and materials',
    'Fundamentals',
    'Practice set 1',
    'Deep dive topic A',
    'Project kickoff',
    'Iterate and improve',
    'Midpoint review',
    'Topic B exploration',
    'Practice set 2',
    'Capstone planning',
    'Capstone execution',
  ];
  const count = Math.max(1, weeks || 1);
  return Array.from({ length: count }, (_, i) => ({
    week: i + 1,
    objective: objectives[i % objectives.length] + (title ? `: ${title}` : ''),
    completed: false,
  }));
}

module.exports = { parseTimeline, generateMilestones };
