
import express from "express";
import mongoose from "mongoose";
import Post from "../models/post.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const router = express.Router();

const getId = (obj) => obj?._id?.toString() || obj?.id?.toString();

const validId = (id) => mongoose.isValidObjectId(id);

// Doctor creates a post
router.post("/", authDoctor, async (req, res) => {
  try {
    const doctorId = getId(req.doc);

    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: "Doctor authentication required",
      });
    }

    const { title, content, mediaUrl, visibility } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const post = await Post.create({
      doctorId,
      title: title.trim(),
      content: content.trim(),
      mediaUrl: mediaUrl || "",
      visibility: visibility === "private" ? "private" : "public",
    });

    return res.status(201).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get public posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ visibility: "public" })
      .populate("doctorId", "name speciality image")
      .sort({ createdAt: -1 });

    return res.json({ success: true, posts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Doctor edits their own post
router.put("/:id", authDoctor, async (req, res) => {
  try {
    const doctorId = getId(req.doc);
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!doctorId || post.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to edit this post",
      });
    }

    const { title, content, mediaUrl, visibility } = req.body;

    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content.trim();
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;
    if (visibility !== undefined) {
      if (!["public", "private"].includes(visibility)) {
        return res.status(400).json({
          success: false,
          message: "Invalid visibility value",
        });
      }
      post.visibility = visibility;
    }

    await post.save();

    return res.json({ success: true, post });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Doctor deletes their own post
router.delete("/:id", authDoctor, async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const doctorId = getId(req.doc);

    if (!doctorId || post.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this post",
      });
    }

    await post.deleteOne();

    return res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// User likes or unlikes a post
router.post("/:id/like", authUser, async (req, res) => {
  try {
    const userId = getId(req.user);
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const post = await Post.findOne({
      _id: id,
      visibility: "public",
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (likedId) => likedId.toString() === userId
    );

    if (alreadyLiked) {
      await Post.updateOne(
        { _id: id },
        { $pull: { likes: userId } }
      );
    } else {
      await Post.updateOne(
        { _id: id },
        { $addToSet: { likes: userId } }
      );
    }

    const updatedPost = await Post.findById(id);

    return res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: updatedPost.likes.length,
      post: updatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// User comments on a public post
router.post("/:id/comment", authUser, async (req, res) => {
  try {
    const userId = getId(req.user);
    const { id } = req.params;
    const comment = req.body.comment?.trim();

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findOne({
      _id: id,
      visibility: "public",
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      userId,
      comment,
      createdAt: new Date(),
    });

    await post.save();

    return res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
