const User = require('../Models/User');
const Profile = require('../Models/Profile');
const uploadFileToCloudinary = require('../Utils/CloudinaryUpload');
const fs = require('fs');
const sendResponse = require('../Utils/Response');
const { scheduleJob } = require('node-schedule');


//! ================= Get Profile =====================
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('profile')
            .select('-password -__v');

        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Create profile if doesn't exist
        if (!user.profile) {
            const newProfile = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: null,
                contactNumber: null,
                location: null
            });
            user.profile = newProfile._id;
            await user.save();
        }

        return sendResponse(res, 200, true, 'Profile retrieved successfully', user);

    } catch (error) {
        next(error);
    }
};



//! ================= Update Profile =====================
const updateProfile = async (req, res, next) => {
    try {
        const { username, dateOfBirth, about, contactNumber, location } = req.body;
        const userId = req.user.userId;

        // Find user with profile
        const user = await User.findById(userId)
            .populate('profile')
            .select('-password');

        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Update username if provided
        if (username) {
            if (username.length < 3 || username.length > 30) {
                return sendResponse(res, 400, false, 'Username must be between 3-30 characters');
            }
            user.username = username;
            await user.save();
        }

        // Prepare profile updates
        const profileUpdates = {};
        if (dateOfBirth) profileUpdates.dateOfBirth = new Date(dateOfBirth);
        if (about) profileUpdates.about = about;
        if (contactNumber) {
            if (!/^\d{10,15}$/.test(contactNumber)) {
                return sendResponse(res, 400, false, 'Invalid contact number format');
            }
            profileUpdates.contactNumber = contactNumber;
        }
        if (location) profileUpdates.location = location;

        // Update profile
        const updatedProfile = await Profile.findByIdAndUpdate(
            user.profile._id,
            profileUpdates,
            { new: true }
        );

        return sendResponse(res, 200, true, 'Profile updated successfully', {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                image: user.image
            },
            profile: updatedProfile
        });

    } catch (error) {
        next(error);
    }
};



//! ================= Upload Profile Picture =====================
const uploadProfilePicture = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ message: 'Please select an image' });

        const result = await uploadFileToCloudinary(file);
        fs.unlinkSync(file.path);

        const user = await User.findByIdAndUpdate(req.user.userId, { image: result.url }, { new: true }).select('-password');

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: user
        });

    } catch (error) {
        next(error);
    }
};



//! ================= Delete Profile =====================

const deleteProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        if (user.deletedAt) {
            return sendResponse(res, 400, false, 'Account deletion already in progress');
        }

        user.deletedAt = new Date();
        await user.save();

        // Schedule deletion after 7 days
        scheduleJob(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), async () => {
            try {
                const userToDelete = await User.findById(userId);
                if (!userToDelete || !userToDelete.deletedAt) return ;

                if (userToDelete.profile) {
                    await Profile.findByIdAndDelete(userToDelete.profile);
                }
                
                await User.findByIdAndDelete(userId);

                console.log(`User ${userToDelete.email} and related data permanently deleted.`);

            } catch (err) {
                console.error('Error during scheduled user deletion:', err);
            }
        });

        return sendResponse(res, 200, true, 'Your account will be deleted in 7 days');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    deleteProfile
};
