import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Isticmaal kan si aad u aqbasho labada field
export const uploadMultiple = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]);

export default upload;