import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  // 🏢 XOGTA AASAASIGA AH
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },    
  about: { type: String, required: true },
  
  // 📍 1. LOCATION GEOJSON (Si Masaafada Loo Xisaabiyo)
  locationText: { type: String, required: true }, 
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // Qaabka: [Longitude, Latitude]
  },

  // 👑 MAAMULKA & MULKIILAHA
  ceoName: { type: String, required: true },        
  holderNumber: { type: String, required: true },   

  // 📞 XIRIIRKA 
  contactNumber: { type: String, required: true }, 
  whatsappNumber: { type: String, default: "" },   

  // 📄 SHATIGA & KALSOONIDA
  license: { type: String, required: true },  
  pharmacistName: { type: String, required: true }, 
  acceptsPrescriptions: { type: Boolean, default: true }, 

  // 🚚 GEYNTA
  deliveryAvailable: { type: Boolean, default: true },

  // 🏦 NIDAAMKA LACAG BIXINTA (Payout Logic)
  payoutMethod: { 
    type: String, 
    required: true, 
    enum: ['Zaad', 'EVC Plus', 'eDahab', 'Mastercard'] 
  }, 
  payoutAccountType: { 
    type: String, 
    required: true, 
    enum: ['Merchant', 'Personal'], 
    default: 'Merchant'
  },
  payoutAccountNumber: { type: String, required: true }, 
  payoutHolderName: { 
    type: String, 
    required: function() { return this.payoutAccountType === 'Personal'; } 
  },

  // 💰 2. XISAABTA & JEEBKA (Wallet System)
  walletBalance: { type: Number, default: 0 }, 
  totalEarnings: { type: Number, default: 0 }, 

  // ⏰ SAACAADAHA SHAQADA
  isOpenNow: { type: Boolean, default: true },
  operatingHours: [
    {
      day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      openingTime: { type: String, default: "08:00" }, 
      closingTime: { type: String, default: "22:00" }, 
      isClosed: { type: Boolean, default: false }      
    }
  ],

  // ⭐️ QIIMEYNTA
  averageRating: { type: Number, default: 0, min: 0, max: 5 }, 
  totalReviews: { type: Number, default: 0 }, 

  // ⚙️ 3 & 4. SYSTEM SETTINGS & SOFT DELETE
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Suspended', 'Rejected'], 
    default: 'Active' 
  },
  isDeleted: { type: Boolean, default: false }, 
  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpire: { type: Date, default: null },
}, { timestamps: true });

// 🔥 INDEXING: Tani waa sirta ka dambaysa in App-ku si degdeg ah u soo saaro farmashiyaha kuugu dhow!
pharmacySchema.index({ location: "2dsphere" });

const pharmacyModel = mongoose.models.pharmacy || mongoose.model("pharmacy", pharmacySchema);
export default pharmacyModel;