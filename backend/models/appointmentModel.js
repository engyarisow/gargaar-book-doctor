import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  
  // Nidaamka Muran-Bixiyaha (Anti-Dispute / Verification PIN)
  meetingPin: { type: String }, // PIN-ka 4-ta god ah ee bukaanka lasiinayo
  isPinVerified: { type: Boolean, default: false } // Wuxuu isku beddelayaa true markuu dhakhtarku PIN-ka saxda ah geliyo
  
}, { timestamps: true }); 

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;