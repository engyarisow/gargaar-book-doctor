import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  payment: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  cancelReason: { type: String, default: '' }, // Waxaa lagu keydinayaa sababta loo xiray
  
  videoSession: {
    meetingLink: String,
    patientJoinedAt: Date,
    doctorJoinedAt: Date,
    actualStart: Date,
    actualEnd: Date,  
    durationInMinutes: { type: Number, default: 0 }
  },

  supportWindow: {
    expiresAt: Date,
    isOpen: { type: Boolean, default: false },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
  },

  status: {
    type: String,
    // ✅ HALKAN WAA LA SAXAY: 'active' ayaa lagu daray liiska
    enum: ['pending', 'scheduled', 'active', 'in-progress', 'completed', 'follow-up', 'no-show', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// Pre-save hook oo kaliya loogu talagalay inuu kiciyo support window-ga 7-da casho ah
consultationSchema.pre('save', function() {
  if (this.isModified('isCompleted') && this.isCompleted) {
    if (!this.supportWindow?.expiresAt) {
        this.supportWindow = {
            ...this.supportWindow,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isOpen: true
        };
    }
    this.status = 'follow-up';
  }
});

const consultationsModel = mongoose.models.consultation || mongoose.model('consultation', consultationSchema);

export default consultationsModel;