import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    // --- Xogta Guud ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },

    // --- Ownership & Smart Logic ---
    certificate: { type: String, required: true },
    
    // Status Logic
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },

    // Yaa dhisay? (Admin, Hospital, ama Clinic)
    ownerType: {
      type: String,
      required: true,
      enum: ['admin', 'hospital']
    },

    // Aqoonsiga qofka dhisay
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'ownerType',
      // XALKA: Waa qasab kaliya haddii uusan dhisayn Admin-ku!
      required: function() {
        return this.ownerType !== 'admin';
      }
    },

    // Ma muuqanayaa? (Freelancers si toos ah ayay u muuqdaan, kuwa kale ilaa la approve gareeyo)
    available: { type: Boolean, default: false },

    // --- Nidaamka Block-ga ---
    blocked: { type: Boolean, default: false },
    blockReason: { type: String, default: "" },
    blockedAt: { type: Date, default: null },

    // --- Reset Password ---
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpire: { type: Date, default: null },
  },
  { minimize: false, timestamps: true }
);

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;