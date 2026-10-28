// backend/models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
    title: String,
    content: String,
    mediaUrl: String,
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        comment: String,
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);