import jwt from 'jsonwebtoken';

const authHospital = async (req, res, next) => {
    try {
        const { htoken } = req.headers;
        if (!htoken) return res.json({ success: false, message: "Login required" });

        const token_decode = jwt.verify(htoken, process.env.JWT_SECRET);
        
        
        req.hospitalId = token_decode.id; 
        
        next();
    } catch (error) {
        res.json({ success: false, message: "Token invalid" });
    }
};
export default authHospital;