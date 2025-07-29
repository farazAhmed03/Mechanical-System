const express = require('express');
const router = express.Router();
const resetController = require('../Controllers/ResetPasswordController');

// !Route to generate reset password token
router.route('/reset-password-token').post(resetController.resetPasswordToken);

// !Route to reset the password
router.route('/reset-password').post(resetController.resetPassword);

module.exports = router;
