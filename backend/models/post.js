
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    content: {
      type: String,
      trim: true,
      maxlength: 10000,
      default: "",
    },

    mediaUrl: {
      type: String,
      trim: true,
      default: "",
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("post", postSchema);

export default Post;
