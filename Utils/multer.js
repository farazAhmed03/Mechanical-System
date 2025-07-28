const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',      // .pdf
        'application/msword',  //  .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',         // .docx
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',      // .pptx
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow',        // .ppsx
        'application/vnd.openxmlformats-officedocument.presentationml.template',        // .potx
        'image/jpeg',         // .jpeg
        'image/png',         //  .png
        'image/jpg',        //   .jpg
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error('Only PDF, Word, PowerPoint, or Image (JPG, JPEG, PNG) files are allowed!'),
            false
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // limits: {
    //     fileSize: 1024 * 1024 * 5
    // }
});

module.exports = upload;
