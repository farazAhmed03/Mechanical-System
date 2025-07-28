

const sendResponse = (res, statusCode, success, message, data) => {
    res.status(statusCode).json({ 
        status: statusCode,
        success: success,
        message: message,
        data: data
    });
};

module.exports = sendResponse;
