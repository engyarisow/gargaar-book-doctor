import express from "express";
import upload from "../middlewares/multer.js"; // multer for file uploads
import authDoctor from "../middlewares/authDoctor.js";
import authUser from "../middlewares/authUser.js";
import {
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  cancelAppointmentDoctor,
  changeAvailability,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  createPost,
  getDoctorPosts,
  updateDoctorPost,
  deleteDoctorPost,
  publicPostList,
  likePost,
  addComment,
  editComment,
  deleteComment,
  likeComment,
  recordView,
  submitAppeal,
  forgotPasswordDoctor,
  resetPasswordDoctor,
  doctorConsultations,
 completeConsultation,
   cancelConsultation,
  doctorJoinCall,
  verifyOTPDoctor,
  verifyMeetingPin,
  
} from "../controllers/doctorController.js";

const doctorRouter = express.Router();

// -------------------- Doctor Auth & Profile --------------------
doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/appointment-complete", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, cancelAppointmentDoctor);
doctorRouter.post("/change-availability", authDoctor, changeAvailability);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.put("/update-profile", authDoctor, updateDoctorProfile);

// -------------------- Doctor Posts --------------------
doctorRouter.post('/create-post', authDoctor, upload.single('image'), createPost);
doctorRouter.get("/posts", authDoctor, getDoctorPosts); // Get all posts for doctor
doctorRouter.put("/posts/:postId", authDoctor, upload.single("image"), updateDoctorPost); // Update post
doctorRouter.delete("/posts/:postId", authDoctor, deleteDoctorPost); // Delete post



// Public posts
doctorRouter.get("/posts/public", publicPostList);



// Likes and comments (users)
doctorRouter.post("/posts/:postId/like", authUser, likePost);
doctorRouter.post("/posts/:postId/comment", authUser, addComment);
doctorRouter.put("/posts/:postId/comment/:commentId", authUser, editComment);
doctorRouter.delete("/posts/:postId/comment/:commentId", authUser, deleteComment);
doctorRouter.post("/posts/:postId/comment/:commentId/like", authUser, likeComment);

//views

doctorRouter.post('/posts/:postId/view', authUser,recordView );
// forgot pass

doctorRouter.post("/forgot-password", forgotPasswordDoctor);
doctorRouter.post("/reset-password/:token", resetPasswordDoctor);
doctorRouter.post('/verify-otp', verifyOTPDoctor);


doctorRouter.post('/send-appeal', submitAppeal);

doctorRouter.get('/consultations', authDoctor, doctorConsultations);

doctorRouter.post('/complete-consultation', authDoctor, completeConsultation);
doctorRouter.post('/cancel-consultation', authDoctor, cancelConsultation);

doctorRouter.post('/join-call', authDoctor,  doctorJoinCall);

doctorRouter.post('/verify-pin', verifyMeetingPin);


export default doctorRouter;