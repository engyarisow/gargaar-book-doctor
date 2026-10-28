import express from 'express';
import { saveMessage, getChatHistory, uploadChatAttachment,getConversations } from '../controllers/chatController.js';
import upload from '../middlewares/multer.js'
import jwt from "jsonwebtoken";


const chatRouter = express.Router();

// Combined Middleware: Allows either User or Doctor
const authAny = (req, res, next) => {
    try {
        const { token } = req.headers; 
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided, login again." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.senderId = decoded.id; 
        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ success: false, message: "Session expired or invalid token." });
    }
};

chatRouter.get('/conversations',authAny, getConversations);

// Routes
chatRouter.get('/history/:consultationId', authAny, getChatHistory);
chatRouter.post('/send', authAny, saveMessage);

// 👇 ADD THIS LINE TO FIX THE 404 ERROR
chatRouter.post('/upload', authAny, upload.single('file'), uploadChatAttachment);

export default chatRouter;