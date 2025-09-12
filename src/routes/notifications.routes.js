const { Router } = require('express');
const { sendCheckinReminders, sendWeeklySummaries } = require('../controllers/notifications.controller');

const router = Router();

// Admin endpoints for sending notifications (could be protected with admin middleware)
router.post('/checkin-reminders', sendCheckinReminders);
router.post('/weekly-summaries', sendWeeklySummaries);

module.exports = router;