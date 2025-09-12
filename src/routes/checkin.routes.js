const express = require('express');
const {
  getCheckinConfig,
  updateCheckinConfig,
  recordCheckin,
  getCheckinHistory,
  getAllCheckinRecords,
} = require('../controllers/checkin.controller');
const protect = require('../middlewares/auth');

const router = express.Router();

router.route('/config').get(protect, getCheckinConfig).put(protect, updateCheckinConfig);
router.route('/record').post(protect, recordCheckin);
router.route('/history/:goalId').get(protect, getCheckinHistory);
router.route('/records').get(protect, getAllCheckinRecords);

module.exports = router;