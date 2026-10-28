// backend/models/appealModel.js
import mongoose from "mongoose";

const appealSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const appealModel = mongoose.models.appeal || mongoose.model("appeal", appealSchema);

export default appealModel;