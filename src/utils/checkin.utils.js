const calculateNextCheckin = (interval, lastCheckin, time) => {
  const now = lastCheckin ? new Date(lastCheckin) : new Date();
  const [hours, minutes] = time.split(':').map(Number);
  now.setHours(hours, minutes, 0, 0); // Set to the specified time

  let nextCheckin = new Date(now);

  switch (interval) {
    case 'daily':
      nextCheckin.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextCheckin.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextCheckin.setMonth(now.getMonth() + 1);
      break;
    default:
      // Default to daily if interval is not recognized
      nextCheckin.setDate(now.getDate() + 1);
      break;
  }
  return nextCheckin;
};

module.exports = { calculateNextCheckin };