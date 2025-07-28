const cloudinary = require('../Config/Cloudinary');
const path = require('path');

// Allowed extensions
const imageExtensions = ['.jpg', '.jpeg', '.png'];
const documentExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];

const uploadFileToCloudinary = async (file) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (imageExtensions.includes(ext)) {
        // Upload image
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'legalsphere/profiles',
        });
        return {
            url: result.secure_url,
            type: 'image'
        };

    } else if (documentExtensions.includes(ext)) {
        // Upload document
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'legalsphere/documents',
            resource_type: 'raw', 
        });
        return {
            url: result.secure_url,
            type: 'document'
        };

    } else if (videoExtensions.includes(ext)) {
        // Upload video
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'legalsphere/videos',
            resource_type: 'video',
        });
        return {
            url: result.secure_url,
            type: 'video'
        };

    } else {
        throw new Error('Unsupported file format');
    }
};

module.exports = uploadFileToCloudinary;

















// Dynamic folder 

// const cloudinary = require('../Config/Cloudinary'); 
// const path = require('path');

// // Allowed extensions
// const imageExtensions = ['.jpg', '.jpeg', '.png'];
// const documentExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
// const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];

// const uploadFileToCloudinary = async (file, customFolder = null) => {
//     const ext = path.extname(file.originalname).toLowerCase();
    
//     let defaultFolder = 'legalsphere/misc';
//     let resourceType = 'auto';
//     let fileType = 'unknown';

//     if (imageExtensions.includes(ext)) {
//         defaultFolder = 'legalsphere/profiles';
//         resourceType = 'image';
//         fileType = 'image';
//     } else if (documentExtensions.includes(ext)) {
//         defaultFolder = 'legalsphere/documents';
//         resourceType = 'raw';
//         fileType = 'document';
//     } else if (videoExtensions.includes(ext)) {
//         defaultFolder = 'legalsphere/videos';
//         resourceType = 'video';
//         fileType = 'video';
//     } else {
//         throw new Error('Unsupported file format');
//     }

//     const uploadFolder = customFolder || defaultFolder;

//     const result = await cloudinary.uploader.upload(file.path, {
//         folder: uploadFolder,
//         resource_type: resourceType,
//     });

//     return {
//         url: result.secure_url,
//         type: fileType,
//         folder: uploadFolder
//     };
// };

// module.exports = uploadFileToCloudinary;
