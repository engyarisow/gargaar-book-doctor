// backend/controllers/doctorController.js
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import post from "../models/post.js";
import cloudinary from "../config/cloudinary.js"; 
import fs from "fs";
import mongoose from "mongoose";
import appealModel from "../models/appealModel.js";
import sendEmail from '../utils/sendEmail.js';
import crypto from "crypto";
import consultationsModel from '../models/consultationsModel.js';
import Message from '../models/MessageModel.js';
// -------------------- CHANGE DOCTOR AVAILABILITY --------------------
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body; // ✅ FIX HERE

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    res.json({
      success: true,
      message: "Availability changed successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// -------------------- GET DOCTOR LIST --------------------
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .populate("addedBy", "name") // XALKA: Wuxuu soo jiidayaa magaca Isbitaalka/Rugta
      .select(["-password", "-email"]);
      
    res.json({ success: true, doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- DOCTOR LOGIN --------------------
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hubi in xogta la soo geliyey
    if (!email || !password) {
      return res.json({ 
        success: false, 
        message: "Fadlan geli email-ka iyo password-ka" 
      });
    }

    // Raadi dhakhtarka
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ 
        success: false, 
        message: "Dhakhtarkan lama helin ama xogtu waa khalad" 
      });
    }

    // Is barbar-dhig password-ka
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.json({ 
        success: false, 
        message: "Password khaldan !" 
      });
    }

    // --- CUSBOONAYSIINTA AMNIGA (STATUS CHECK) ---
    
    // Haddii dhakhtarka uu ku daray Hospital ama Clinic, waa inuu ahaadaa 'Approved'
    // Haddii 'ownerType' uu yahay 'admin', isagu horey ayuu Approved u yahay
    if (doctor.ownerType !== 'admin' && doctor.status === 'Pending') {
      return res.json({ 
        success: false, 
        message: "Account-kaaga wali lama ansixin. Fadlan sug ilaa Admin-ka ka approve gareeyo codsiga Hospital-ka/Clinic-ga." 
      });
    }

    if (doctor.status === 'Rejected') {
      return res.json({ 
        success: false, 
        message: "Waan ka xunnahay, codsigaaga waa la diiday (Rejected). La xidhiidh isbitaalkaagii." 
      });
    }

    
    if (doctor.blocked) {
      return res.json({ 
        success: false, 
        message: "Account-kaaga waa la xannibay, fadlan la xidhiidh Admin-ka" 
      });
    }

    // Haddii wax kasta sax yihiin, dhali Token
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    
    res.json({ 
      success: true, 
      token, 
      message: "Si guul leh ayaad u gashay" 
    });

  } catch (error) {
    console.log(error);
    res.json({ 
      success: false, 
      message: "Cillad ayaa dhacday: " + error.message 
    });
  }
};

// -------------------- GET DOCTOR APPOINTMENTS --------------------
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.doc?.id;
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const appointments = await appointmentModel.find({ docId }).sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- MARK APPOINTMENT COMPLETE --------------------
// -------------------- MARK APPOINTMENT COMPLETE --------------------
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.doc?.id;
    const { appointmentId } = req.body;
    
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!appointmentId) return res.status(400).json({ success: false, message: "Appointment ID required" });

    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (appointment.docId.toString() !== docId) return res.status(403).json({ success: false, message: "Unauthorized action" });

    // 🔥 KORDHINTA CUSUB: Hubi in PIN-ka la xaqiijiyay ka hor inta aan la dhamaystirin
    if (!appointment.isPinVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Fadlan xaqiiji PIN-ka bukaan-ka (Verify PIN) ka hor inta aadan ballanta dhamaystirin." 
      });
    }

    // Haddii PIN-ka la xaqiijiyay, u bedel Completed
    appointment.isCompleted = true;
    await appointment.save();

    res.json({ success: true, message: "Appointment marked as complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- CANCEL APPOINTMENT --------------------
const cancelAppointmentDoctor = async (req, res) => {
  try {
    const docId = req.doc?.id;
    const { appointmentId } = req.body;
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!appointmentId) return res.status(400).json({ success: false, message: "Appointment ID required" });

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (appointment.docId.toString() !== docId) return res.status(403).json({ success: false, message: "Unauthorized action" });

    appointment.cancelled = true;
    await appointment.save();

    // Free up booked slot
    const doctor = await doctorModel.findById(docId);
    if (doctor?.slots_booked && appointment.slotDate) {
      doctor.slots_booked[appointment.slotDate] = (doctor.slots_booked[appointment.slotDate] || []).filter(
        slot => slot !== appointment.slotTime
      );
      await doctor.save();
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const doctorDashboard = async (req, res) => {
  try {
    // 1. SECURITY & VALIDATION: Ensure docId exists
    const docId = req.doc?.id;
    if (!docId) {
      return res.status(401).json({ success: false, message: "Unauthorized access. Doctor ID missing." });
    }

    // 2. PERFORMANCE: Fetch only needed fields and use .lean() for speed
    const selectFields = 'amount isCompleted status cancelled userId patientId docId doctorId slotDate slotTime createdAt userData type';

    const [allAppointments, allConsultations] = await Promise.all([
      appointmentModel.find({ docId }).select(selectFields).lean(),
      consultationsModel.find({ doctorId: docId }).select(selectFields).lean()
    ]);

    let clinicEarnings = 0;
    let videoEarnings = 0;
    let completedClinicCount = 0;
    let completedVideoCount = 0;
    const patientsSet = new Set();

    // 3. SAFE MATH: Calculate Clinic Stats
    allAppointments.forEach(item => {
      if ((item.isCompleted === true || item.status === "completed") && item.cancelled === false) {
        clinicEarnings += Number(item.amount) || 0;
        completedClinicCount++;
        if (item.userId) patientsSet.add(item.userId.toString());
      }
    });

    // 3. SAFE MATH: Calculate Video Stats (Halkan ayaa la hagaajiyay si ay u eegto labada halbeeg)
    allConsultations.forEach(item => {
      if ((item.status === "completed" || item.isCompleted === true) && item.cancelled === false) {
        videoEarnings += Number(item.amount) || 0;
        completedVideoCount++;
        const patientId = item.patientId || item.userId;
        if (patientId) patientsSet.add(patientId.toString());
      }
    });

    // 4. MEMORY OPTIMIZATION: Get latest 5 efficiently
    const sortedAppts = allAppointments.sort((a, b) => new Date(b.createdAt || b.slotDate || 0) - new Date(a.createdAt || a.slotDate || 0)).slice(0, 5);
    const sortedConsults = allConsultations.sort((a, b) => new Date(b.createdAt || b.slotDate || 0) - new Date(a.createdAt || a.slotDate || 0)).slice(0, 5);

    // Merge only the top 10 items, sort them, and take the final top 5
    const combinedLatest = [
      ...sortedAppts.map(a => ({ ...a, type: 'appointment' })),
      ...sortedConsults.map(c => ({ ...c, type: 'consultation' }))
    ]
    .sort((a, b) => new Date(b.createdAt || b.slotDate || 0) - new Date(a.createdAt || a.slotDate || 0))
    .slice(0, 5);

    // 5. CLEAN RESPONSE
    return res.status(200).json({
      success: true,
      dashData: {
        earnings: clinicEarnings + videoEarnings,
        clinicEarnings,
        videoEarnings,
        patients: patientsSet.size,
        appointments: completedClinicCount,
        consultations: completedVideoCount,
        latestAppointments: combinedLatest
      }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error while loading dashboard." });
  }
};
// -------------------- DOCTOR PROFILE --------------------
const doctorProfile = async (req, res) => {
  try {
    const docId = req.doc?.id; // Or req.body.docId depending on your auth middleware extraction
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Added .populate('addedBy', 'name') to fetch the name of the managing institution
    const profileData = await doctorModel
      .findById(docId)
      .select("-password")
      .populate("addedBy", "name");

    if (!profileData) return res.status(404).json({ success: false, message: "Doctor not found" });

    res.json({ success: true, profileData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- UPDATE DOCTOR PROFILE --------------------
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doc?.id;
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { address, fees, available, degree, experience, about } = req.body || {};
    const updateFields = {};

    // 1. CRITICAL IMAGE CORRECTION: 
    // Check if Multer processed a newly uploaded file image asset via req.file
    if (req.file && req.file.path) {
      updateFields.image = req.file.path; // Sets your new secure Cloudinary/storage URL string
    }

    // 2. ADDRESS CORRECTION:
    // If the frontend sent address as a stringified JSON object inside FormData, parse it cleanly
    if (address) {
      try {
        const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
        updateFields.address = {
          Line1: parsedAddress.Line1 || parsedAddress.line1 || "",
          Line2: parsedAddress.Line2 || parsedAddress.line2 || ""
        };
      } catch (parseError) {
        // Fallback fallback if it was already an unstringified object payload
        updateFields.address = address;
      }
    }

    // 3. Map across regular data fields safely
    if (fees !== undefined) updateFields.fees = Number(fees);
    if (available !== undefined) updateFields.available = available === "true" || available === true;
    if (degree !== undefined) updateFields.degree = degree;
    if (experience !== undefined) updateFields.experience = experience;
    if (about !== undefined) updateFields.about = about;

    // Save changes using dynamic $set validation parameters
    const updatedDoctor = await doctorModel
      .findByIdAndUpdate(docId, { $set: updateFields }, { new: true })
      .select("-password");

    if (!updatedDoctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Returns the freshly modified doctor object layout precisely so your frontend can draw the changes
    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      doctor: updatedDoctor,
      profileData: updatedDoctor 
    });
    
  } catch (err) {
    console.error("Backend Save Error Handler context:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// 1. CREATE POST
 const createPost = async (req, res) => {
  try {
    const docId = req.doc?.id;
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { title, content, isPublic } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    let mediaUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "doctor-posts",
      });
      mediaUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const newPost = new Post({
      doctorId: docId,
      title,
      content,
      mediaUrl,
      visibility: isPublic === "true" || isPublic === true ? "public" : "private",
    });

    await newPost.save();
    res.status(201).json({ success: true, message: "Post created successfully", post: newPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const recordView = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id; // The ID of the patient/user viewing

    await Post.findByIdAndUpdate(postId, {
      $addToSet: { viewers: userId } // $addToSet prevents duplicate views from same user
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. GET DOCTOR POSTS (With Stats)
export const getDoctorPosts = async (req, res) => {
  try {
    const docId = req.doc?.id;
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const posts = await Post.find({ doctorId: docId })
      .populate("doctorId", "name image") // Waxaan ku daray dhakhtarka magaciisa iyo sawirkiisa
      .populate("comments.userId", "name image")
      .sort({ createdAt: -1 });

    const postsWithStats = posts.map(post => ({
      ...post._doc,
      likesCount: post.likes ? post.likes.length : 0,
      viewsCount: post.viewers ? post.viewers.length : 0, 
      commentsCount: post.comments ? post.comments.length : 0,
    }));

    res.status(200).json({ success: true, posts: postsWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. UPDATE POST
export const updateDoctorPost = async (req, res) => {
  try {
    const docId = req.doc?.id;
    const { postId } = req.params;
    if (!docId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const post = await Post.findOne({ _id: postId, doctorId: docId });
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const { title, content, isPublic } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (isPublic !== undefined) post.visibility = isPublic === "true" || isPublic === true ? "public" : "private";

    if (req.file) {
      if (post.mediaUrl) {
        const publicId = post.mediaUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`doctor-posts/${publicId}`);
      }
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "doctor-posts" });
      post.mediaUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    await post.save({ validateModifiedOnly: true });
    res.status(200).json({ success: true, message: "Post updated successfully", post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. DELETE POST
export const deleteDoctorPost = async (req, res) => {
  try {
    const docId = req.doc?.id;
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId, doctorId: docId });
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.mediaUrl) {
      const publicId = post.mediaUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`doctor-posts/${publicId}`);
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. PUBLIC POSTS
export const publicPostList = async (req, res) => {
  try {
    const posts = await Post.find({ visibility: "public" })
      .populate("doctorId", "name degree image")
      .populate("comments.userId", "name image")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
      ...post._doc,
      likesCount: post.likes.length,
      viewsCount: post.viewers.length,
      commentsCount: post.comments.length,
    }));

    res.json({ success: true, posts: formattedPosts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. LIKE/UNLIKE POST
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
    const updateQuery = alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, { new: true });
    res.json({ success: true, likes: updatedPost.likes, likesCount: updatedPost.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 8. COMMENTS (ADD, DELETE, EDIT, LIKE)
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: "Comment is required" });

    const newComment = { userId: req.user.id, comment: comment.trim(), likes: [] };
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    ).populate("comments.userId", "name image");

    res.json({ success: true, comment: updatedPost.comments[updatedPost.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    await Post.findOneAndUpdate(
      { _id: postId },
      { $pull: { comments: { _id: commentId, userId: req.user.id } } }
    );
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, "comments._id": commentId, "comments.userId": req.user.id },
      { $set: { "comments.$.comment": comment } },
      { new: true }
    ).populate("comments.userId", "name image");
    res.json({ success: true, comment: updatedPost.comments.id(commentId) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    const comment = post.comments.id(commentId);
    const isLiked = comment.likes.some(id => id.toString() === req.user.id.toString());
    const updateQuery = isLiked ? { $pull: { "comments.$.likes": req.user.id } } : { $addToSet: { "comments.$.likes": req.user.id } };

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, "comments._id": commentId },
      updateQuery,
      { new: true }
    ).populate("comments.userId", "name image");

    res.json({ success: true, comment: updatedPost.comments.id(commentId) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitAppeal = async (req, res) => {
  try {
    const { email, reason } = req.body;

    // Find the doctor by email to get their ID
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Check if an appeal is already pending
    const existingAppeal = await appealModel.findOne({ doctorId: doctor._id, status: "pending" });
    if (existingAppeal) {
      return res.status(400).json({ success: false, message: "You already have a pending appeal." });
    }

    const newAppeal = new appealModel({
      doctorId: doctor._id,
      reason: reason
    });

    await newAppeal.save();

    res.json({ success: true, message: "Appeal submitted successfully. Admin will review it." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// -------------------- FORGOT PASSWORD (Dhalinta Token-ka) --------------------


const forgotPasswordDoctor = async (req, res) => {
    try {
        const { email } = req.body;
        const doctor = await doctorModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!doctor) return res.json({ success: false, message: "Dhakhtar leh iimaylkan lama helin!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        doctor.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        doctor.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Daqiiqo

        await doctor.save();
        
        // --- HALKAN AYAA LAGU XIRAY SEND-EMAIL-KAAGA ---
        await sendEmail({
            email: doctor.email,
            subject: "Gargaar Portal - Dib u habaynta Password-ka (OTP)",
            message: `Haye Dhakhtar,\n\nWaxaad codsatay in aad beddesho password-kaaga Gargaar Portal.\n\nKoodhkaaga xaqiijinta (OTP) waa:\n\n ${otp} \n\nKoodhkani wuxuu dhacayaa 10 daqiiqo gudahood. Fadlan ha cidna la wadaagin.`
        });

        res.json({ success: true, message: "OTP ayaa email-kaaga loo diray!", email: doctor.email });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Verify OTP (Hubinta OTP-ga)
export const verifyOTPDoctor = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const doctor = await doctorModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            resetPasswordToken: hashedOTP,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!doctor) return res.json({ success: false, message: "OTP waa khalad ama waqtigiisu wuu dhacay!" });

        res.json({ success: true, message: "OTP waa sax!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Reset Password (Bedelaadda Password-ka)
 const resetPasswordDoctor = async (req, res) => {
    try {
        const { token } = req.params; // Token-kan waa OTP-gii oo la soo raaciyay URL-ka
        const { password } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const doctor = await doctorModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!doctor) return res.json({ success: false, message: "Waqtiga OTP-ga wuu dhacay, fadlan isku day mar kale!" });

        const salt = await bcrypt.genSalt(10);
        doctor.password = await bcrypt.hash(password, salt);
        doctor.resetPasswordToken = undefined;
        doctor.resetPasswordExpire = undefined;

        await doctor.save();
        res.json({ success: true, message: "Password-ka si guul leh ayaa loo bedelay!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
//
// Soo qaad dhammaan Video Consultations-ka dhakhtarka gaarka u ah
// -------------------- GET VIDEO CONSULTATIONS --------------------
export const doctorConsultations = async (req, res) => {
    try {
        // FIX: Changed 'req.res' to 'req.doc.id' to match your auth middleware logic
        const docId = req.doc?.id; 

        if (!docId) {
            return res.status(401).json({ success: false, message: "Dhakhtarka lama aqoonsan" });
        }

        const consultations = await consultationsModel.find({ doctorId: docId })
            .populate('patientId', 'name image email') 
            .sort({ createdAt: -1 });

        res.json({ success: true, consultations });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API: Marka dhakhtarku "Done" riixo
// ===================== COMPLETE CONSULTATION =====================
 
 export const completeConsultation = async (req, res) => {
    try {
        const { consultationId } = req.body;
        const docId = req.doc?.id;

        if (!docId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const consultationData = await consultationsModel.findById(consultationId);

        if (!consultationData) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            });
        }

        if (!consultationData.doctorId.equals(docId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // 🔥 START VIDEO SESSION (NOT COMPLETE)
        const updatedConsultation = await consultationsModel.findByIdAndUpdate(
            consultationId,
            {
                status: "active",
                "videoSession.startTime": new Date(),
                "videoSession.isCompleted": false
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Video consultation started",
            data: updatedConsultation
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
  

// ===================== CANCEL CONSULTATION =====================
export const cancelConsultation = async (req, res) => {
    try {
        const { consultationId } = req.body;
        const docId = req.doc?.id;

        if (!docId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const consultationData = await consultationsModel.findById(consultationId);

        if (!consultationData) {
            return res.json({
                success: false,
                message: "Consultation not found"
            });
        }

        if (!consultationData.doctorId) {
            return res.json({
                success: false,
                message: "Consultation missing doctorId"
            });
        }

        if (consultationData.doctorId.toString() !== docId.toString()) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        await consultationsModel.findByIdAndUpdate(consultationId, {
            cancelled: true
        });

        return res.json({
            success: true,
            message: "Consultation cancelled successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const doctorJoinCall = async (req, res) => {
    try {
        const { consultationId } = req.body; 
        const now = new Date();

        const consultation = await consultationsModel.findById(consultationId);
        if (!consultation) {
            return res.json({ success: false, message: 'Ballanta lama helin' });
        }

        consultation.videoSession = consultation.videoSession || {};
        // Diiwaangeli waqtiga dhaqtarka
        consultation.videoSession.doctorJoinedAt = now;

        await consultation.save();
        res.json({ success: true, message: 'Dhaqtarku wuxuu soo galay call-ka' });

    } catch (error) {
        console.error("Cillad doctorJoinCall:", error);
        res.json({ success: false, message: error.message });
    }
};

// Controller-ka lagu xaqiijinayo Code-ka Kulamada (Doctor Side ama Admin Side)
export const verifyMeetingPin = async (req, res) => {
  try {
    const { appointmentId, pin } = req.body;

    // 1. Soo saar ballanta la rabo in la xaqiijiyo
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Ballanta la raadinayo lama helin." });
    }

    // 2. Hubi haddii ballanta horay loo xaqiijiyay
    if (appointment.isPinVerified) {
      return res.json({ success: false, message: "Code-kan horay ayaa loo xaqiijiyay oo loo isticmaalay." });
    }

    // 3. Isku ekaysii PIN-ka uu dhakhtarku geliyay iyo kii kaydsanaa
    if (appointment.meetingPin === pin.trim()) {
      
      // Waxay isku beddelaysaa true, laakiin isCompleted waxba kama beddeleyno (sida aad codsatay)
      appointment.isPinVerified = true; 
      await appointment.save();

      return res.json({ success: true, message: "Code-ka kulanka si guul leh ayaa loo xaqiijiyay! (Safe & Verified)" });
    } else {
      return res.json({ success: false, message: "Code-ka aad gelisay waa khalad. Fadlan dib u tijaabi." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- EXPORT ALL FUNCTIONS --------------------
export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  cancelAppointmentDoctor,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  createPost,
 submitAppeal,
 forgotPasswordDoctor,
 resetPasswordDoctor,
};