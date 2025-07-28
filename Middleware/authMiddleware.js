
const jwt = require('jsonwebtoken');
const sendResponse = require('../Utils/Response');

function auth(req, res, next) {
    let token = req.body.token || req.cookies.token || (req.headers.authorization && req.headers.authorization?.split(' ')[1]);
    // console.log('Token : ', token);

    if (!token) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded JWT:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.clearCookie('token', { secure: true, sameSite: 'None' });
            return sendResponse(res, 401, { message: 'Token expired' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return sendResponse(res, 401, { message: 'Invalid token' });
        }
        next(error);
    }
}

module.exports = auth;
