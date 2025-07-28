const multer = require('multer');

const errorHandler = (err, req, res, next) => {

  const isProduction = process.env.NODE_ENV === 'production';
  console.error("Error Stack:", err.stack); 

  // Built-in error 
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Multer error occurred during file upload.',
    });
  }

  // Custom error
  if (err.message === 'Only PDF, Word, PowerPoint, or Image (JPG, JPEG, PNG) files are allowed!') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Server error
  return res.status(500).json({
    success: false,
    message: isProduction ? "Something went wrong. Please try again later" : err.message,
  });
};

module.exports = errorHandler;
