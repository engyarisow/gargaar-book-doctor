import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'requesterModel' },
  requesterModel: { type: String, required: true, enum: ['doctor', 'hospital', 'Pharmacy'] },
  
  amountRequested: { type: Number, required: true }, 
  payoutMethod: { type: String, required: true }, 
  accountNumber: { type: String, required: true }, 
  
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  
  adminReference: { type: String },              
  processedAt: { type: Date }
}, { timestamps: true });

const withdrawalModel = mongoose.models.withdrawal || mongoose.model('withdrawal', withdrawalSchema);
export default withdrawalModel;