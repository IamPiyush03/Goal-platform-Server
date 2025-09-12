const { Router } = require('express');
const auth = require('../middlewares/auth');
const { getProgress } = require('../controllers/progress.controller');

const router = Router();

router.get('/:goalId', auth, getProgress);

module.exports = router;


