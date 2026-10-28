import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.id || decoded._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid token payload" });
        }

        
        if (req.body) {
            req.body.userId = userId;
        }
        
        
        req.userId = userId;
        req.user = { id: userId };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Token expired or invalid, please login again",
        });
    }
};

export default authUser;