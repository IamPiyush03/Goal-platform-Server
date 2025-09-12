const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getProgress, getOverallProgress } = require('../controllers/progress.controller');

const router = Router();

router.get('/:goalId', auth, getProgress);
router.get('/', auth, getOverallProgress);

module.exports = router;


