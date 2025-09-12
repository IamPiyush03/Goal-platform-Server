const { Router } = require('express');
const auth = require('../middlewares/auth');
const { chat } = require('../controllers/chat.controller');

const router = Router();

router.post('/', auth, chat);

module.exports = router;


