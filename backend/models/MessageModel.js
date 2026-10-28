import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // Links to the consultation session
    consultationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'consultation', 
        required: true 
    },
    // The ID of the person sending the message (Doctor or Patient)
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    senderType: { 
        type: String, 
        enum: ['patient', 'doctor'], 
        required: true 
    },
    // Nested content to support modern chat features
    content: {
        text: { type: String, default: "" },
        fileUrl: { type: String, default: null }, 
        fileType: { 
            type: String, 
            // 1. ISBADALKA KOOWAAD: Waxaan halkan ku darnay 'prescription'
            enum: ['text', 'image', 'audio', 'video', 'prescription'], 
            default: 'text' 
        },
        fileName: { type: String, default: "" },
        // 2. ISBADALKA LABAAD: Waxaan ku darnay meeshii xogta daawadu gali lahayd
        prescriptionData: { 
            type: Object, 
            default: null 
        }
    },
    // KAN AYAA LAGU DARAY SI BLUE TICK-GA LOO XAKAMEEYO
    seen: { 
        type: Boolean, 
        default: false 
    },
    time: { type: Date, default: Date.now }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;