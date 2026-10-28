import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ownerModel' },
  ownerModel: { type: String, required: true, enum: ['doctor', 'hospital', 'Pharmacy'] },
  
  availableBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 }, // 🔥 Waan ku darnay si Dashboard-ku u shaqeeyo
  totalWithdrawn: { type: Number, default: 0 }       
}, { timestamps: true });

const walletModel = mongoose.models.wallet || mongoose.model('wallet', walletSchema);
export default walletModel;