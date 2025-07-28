const express = require("express");
const router = express.Router();
const chatController = require("../Controllers/ChatController");
const auth = require("../Middleware/authMiddleware");
const upload = require("../Utils/multer");

// Message Routes
router.post('/send-message', auth, upload.array('files'), chatController.sendMessage);
router.get('/list', auth, chatController.getChatList);
router.get('/messages/:userId', auth, chatController.getChatMessages);
router.delete('/messages/:userId/clear', auth, chatController.clearChat);

module.exports = router;
