import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'pharmacy', required: true },
  
  items: [
    {
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true }, // 👈 HALKAN AYAA LA SAXAY
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],

  totalAmount: { type: Number, required: true }, 
  platformCommission: { type: Number, required: true }, 
  pharmacyPayoutAmount: { type: Number, required: true }, 

  userPaymentMethod: { type: String, default: 'Stripe' },
  stripeSessionId: { type: String, required: true }, 
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'PaidToPlatform', 'Failed'] },

  pharmacyPayoutMethod: { type: String, required: true }, 
  pharmacyPayoutAccount: { type: String, required: true }, 
  payoutStatus: { type: String, default: 'Holding', enum: ['Holding', 'ReleasedToPharmacy'] },

  orderStatus: { type: String, default: 'Placed', enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  address: { type: Object, required: true },
  
  // 🔐 QAYBTA VERIFICATION CODE-KA
  verificationCode: { type: String, required: true }, 
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;