const User = require('../Models/User');
const OTP = require('../Models/OTP');
const profileModel = require('../Models/Profile');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const generateToken = require('../Utils/GenerateTokens');
const mailSender = require('../Utils/Nodemailer');
const generateOTP = require('../Utils/GenerateOTP');
const sendResponse = require('../Utils/Response');
const { PASSWORD_RESET_REQUEST_TEMPLATE } = require('../Templates/emailVerification');
require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';


//! ==================== SEND OTP ====================
const sendOTP = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return sendResponse(res, 400, false, 'Email is required');

    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser) return sendResponse(res, 400, false, 'Email already exists');

    try {
        let otp = generateOTP();
        while (await OTP.findOne({ otp })) {
            otp = generateOTP();
        }

        const otpBody = await OTP.create({ email, otp });

        return sendResponse(res, 200, true, 'OTP sent to email', otpBody);
    } catch (error) {
        next(error);
    }
};

//! ==================== VERIFY OTP ====================
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return sendResponse(res, 400, false, 'Email and OTP are required');

        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (!recentOtp.length || recentOtp[0].otp !== otp) {
            return sendResponse(res, 400, false, 'Invalid OTP!');
        }

        const otpExpiry = 5 * 60 * 1000;
        if (Date.now() - recentOtp[0].createdAt > otpExpiry) {
            return sendResponse(res, 400, false, 'OTP has expired!');
        }

        const user = await User.findOne({ email });
        if (!user) return sendResponse(res, 404, false, 'User not found');
        user.isVerified = true;
        await user.save();
        await OTP.deleteMany({ email });

        return sendResponse(res, 200, true, 'OTP verified successfully');
    } catch (error) {
        next(error);
    }
};

//! ==================== REGISTER ====================
const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return sendResponse(res, 400, false, 'All fields are required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return sendResponse(res, 400, false, 'Email already exists');

        const profile = await profileModel.create({});

        const user = new User({
            username,
            email,
            password,
            role,
            profile: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${username}`,
        });

        await user.save();
        return sendResponse(res, 201, true, 'User registered successfully', user);

    } catch (error) {
        next(error);
    }
};

//! ==================== LOGIN ====================
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return sendResponse(res, 401, false, 'Invalid credentials');
        }

        const token = generateToken({ userId: user._id, role: user.role });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            expires: new Date(Date.now() + 3600000),
        };

        user = user.toObject();
        delete user.password;
        user.token = token;

        res.cookie('token', token, cookieOptions);
        return sendResponse(res, 200, true, 'Login successful', user);
    } catch (error) {
        next(error);
    }
};


// //! ==================== Admin Login =======================
// const adminLogin = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email, role: "admin" });
//         if (!user || !(await user.comparePassword(password))) {
//             return sendResponse(res, 401, false, 'Invalid credentials');
//         }
//         const token = generateToken({ userId: user._id, role: user.role });

//         const cookieOptions = {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
//             expires: new Date(Date.now() + 3600000),
//         };

//         user = user.toObject();
//         delete user.password;
//         user.token = token;
//         res.cookie('token', token, cookieOptions);

//         return sendResponse(res, 200, true, 'Login successful', user);
//     } catch (error) {
//         next(error);
//     }
// }

//! ==================== LOGOUT ====================
const logout = async (req, res, next) => {
    const user = req.user.userId;
    if (!user) {
        return sendResponse(res, 400, false, "User not Login!");
    }
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
        });

        return sendResponse(res, 200, true, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};


//! ==================== RESET PASSWORD TOKEN ====================
const resetPasswordToken = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return sendResponse(res, 400, false, 'Email is required');

    try {
        const user = await User.findOne({ email });
        if (!user) return sendResponse(res, 404, false, 'User not found');

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpiresAt = Date.now() + 5 * 60 * 1000;
        await user.save();

        const baseUrl = (process.env.BASE_URL_PASSWORD_RESET || `http://localhost:${process.env.PORT}`).replace(/\/$/, '');
        const url = `${baseUrl}/reset-password/${token}`;
        const body = PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', url);

        await mailSender(email, 'Password Reset', body, true);
        return sendResponse(res, 200, true, 'Reset link sent to your email', { resetURL: url });
    } catch (error) {
        next(error);
    }
};

//! ==================== RESET PASSWORD ====================
const resetPassword = async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (!password || !confirmPassword){
        return sendResponse(res, 400, false, 'All fields are required');about
    }

    if (password !== confirmPassword){
        return sendResponse(res, 400, false, 'Passwords do not match');
    }

    try {
        const user = await User.findOne({ resetPasswordToken: token });
        if (!user) {
            return sendResponse(res, 400, false, 'Invalid or expired token');
        }
        
        if (user.resetPasswordExpiresAt < Date.now()){
            return sendResponse(res, 400, false, 'Token expired');
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpiresAt = null;
        await user.save();

        return sendResponse(res, 200, true, 'Password reset successfully');
    } catch (error) {
        next(error);
    }
};

//! ==================== CHECK AUTH ====================
const checkAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return sendResponse(res, 401, false, 'User not found');
        return sendResponse(res, 200, true, 'User is authenticated', user);
    } catch (error) {
        next(error);
    }
};

//! ==================== INITIALIZE ADMIN USER ====================
const initializeAdminUser = async () => {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = '123';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const profile = await profileModel.create({});


    const adminUser = new User({
      username: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      profile: profile._id,
      isVerified: true,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=Admin`
    });

    await adminUser.save();
    console.log(`Default admin created: ${adminEmail}`);
  } else {
    console.log(`ℹAdmin already exists: ${adminEmail}`);
  }
};


//! ==================== ROLE MIDDLEWARES ====================
const isAdmin = (req, res, next) => req.user.role === 'admin' ? next() : sendResponse(res, 403, false, 'Admins only');
const isClient = (req, res, next) => req.user.role === 'client' ? next() : sendResponse(res, 403, false, 'Clients only');



// Exports
module.exports = {
    sendOTP,
    verifyOTP,
    register,
    login,
    logout,
    resetPasswordToken,
    resetPassword,
    checkAuth,
    initializeAdminUser,
    isAdmin,
    isClient,
};
