import mongoose from "mongoose"; // Safkan ayaa kaa maqnaa!

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    logo: { type: String, required: true },
    license: { type: String, required: true },
    location: { type: String, required: true },
    about: { type: String, required: true },
    speciality: { type: Array, default: [] },
    status: { type: String, default: 'approved' },
    blocked: { type: Boolean, default: false },
    date: { type: Number, required: true },
    // 🔐 RESET PASSWORD FIELDS
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpire: { type: Date, default: null },
}, { minimize: false });

const hospitalModel = mongoose.models.hospital || mongoose.model("hospital", hospitalSchema);

export default hospitalModel;