import jwt from 'jsonwebtoken'

const authPharmacy = async (req, res, next) => {
    try {
        // Waxaan u beddelnay 'ptoken' (Pharmacy Token)
        const { ptoken } = req.headers;

        if (!ptoken) {
            return res.json({ 
                success: false, 
                message: "Ma laguu oggola, fadlan mar kale login samee (Pharmacy)." 
            });
        }

        // Xaqiijinta Token-ka
        const token_decode = jwt.verify(ptoken, process.env.JWT_SECRET);

        // Waxaan halkan ku kaydinaynaa Pharmacy ID-ga bedelkii clinicId
        req.pharmacyId = token_decode.id; 

        next(); // U gudbi controller-ka xiga

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Token-kaagu ma shaqaynayo: " + error.message });
    }
}

export default authPharmacy;