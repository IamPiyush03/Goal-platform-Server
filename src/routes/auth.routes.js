const { Router } = require('express');
const { signup, login, verifyEmail, resendVerification, requestPasswordReset, resetPassword } = require('../controllers/auth.controller');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
