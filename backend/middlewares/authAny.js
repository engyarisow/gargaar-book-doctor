// In your chatRoute.js or a separate middleware file
import jwt from "jsonwebtoken";

const authAny = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Standardize the ID: whether it's a doctor or a patient, we put it in req.senderId
        req.senderId = decoded.id || decoded._id;
        
        // This allows the controller to know who is sending the message
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }
};