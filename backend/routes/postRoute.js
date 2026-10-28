// backend/routes/postRoute.js
import express from "express";
import post from "../models/post.js";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

const router = express.Router();

// Doctor creates post
router.post("/", authDoctor, async (req, res) => {
  try {
    const post = new Post({ ...req.body, doctorId: req.doc.id });
    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all public posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ visibility: "public" })
      .populate("doctorId", "name speciality image")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor edit post
router.put("/:id", authDoctor, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.doctorId.toString() !== req.doc.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor delete post
router.delete("/:id", authDoctor, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.doctorId.toString() !== req.doc.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User like
router.post("/:id/like", authUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) post.likes.push(req.user.id);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User comment
router.post("/:id/comment", authUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ userId: req.user.id, comment: req.body.comment });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;