const { Router } = require('express');
const auth = require('../middlewares/auth');
const { chat, getChatHistory } = require('../controllers/chat.controller');

const router = Router();

router.get('/:goalId', auth, getChatHistory);
router.post('/', auth, chat);

module.exports = router;


