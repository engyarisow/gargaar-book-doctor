import mongoose from "mongoose";

const internalPayoutSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
  
  amountPaid: { type: Number, required: true },      
  paymentMethod: { type: String, required: true }, // Tusaale: Cash, Zaad, Bank Transfer
  referenceNumber: { type: String, required: true }, 
  
  paymentDate: { type: Date, default: Date.now },
  notes: { type: String }                            
}, { timestamps: true });

const internalPayoutModel = mongoose.models.internalPayout || mongoose.model('internalPayout', internalPayoutSchema);
export default internalPayoutModel;