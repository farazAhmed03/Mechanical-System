const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const profileController = require('../Controllers/ProfileController');
const auth = require('../Middleware/authMiddleware');
const upload = require('../Utils/multer');
// const limit = require('../Utils/RateLimit');

// Auth Routes 
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password-token', authController.resetPasswordToken);
router.post('/reset-password/:token', authController.resetPassword);
router.post("/logout", auth, authController.logout);
router.get('/check-auth', auth, authController.checkAuth);


// Profile Routes
router.get('/profile', auth, profileController.getProfile);
router.get('/profile/:id', auth, profileController.getSingleProfile);
router.put('/profile/update', auth, profileController.updateProfile);
router.put('/profile/upload', auth, upload.single('image'), profileController.uploadProfilePicture);


// Protected Routes 
router.get('/admin', auth, authController.isAdmin, async(req, res) => res.send("Admin Route"));
router.get('/client', auth, authController.isClient, async(req, res) => res.send("Client Route"));
router.get('/user', async(req, res) => res.send("User Route"));

module.exports = router;
