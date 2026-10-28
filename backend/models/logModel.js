import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true 
  }, 
  performedBy: { 
    type: String, 
    required: true // Admin ID or Email
  }, 
  targetId: { 
    type: String, 
    required: true // Doctor ID
  }, 
  targetType: { 
    type: String, 
    default: "doctor" 
  },
  message: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const logModel = mongoose.models.log || mongoose.model("log", logSchema);

export default logModel;