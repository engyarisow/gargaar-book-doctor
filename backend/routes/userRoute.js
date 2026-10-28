import express from "express";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
   bookConsultation,
  listUserConsultations,
  cancelConsultation,
  patientJoinCall,
   forgotPasswordUser,
   resetPasswordUser,
 verifyOTPUser,
verifyStripe,
placeOrderStripe,
verifyOrderStripe,
addToCart,
 getUserCart,
 updateCart,
 userOrders,
} from "../controllers/userController.js";

const router = express.Router(); // ✅ This was missing

// -------------------- USER AUTH & PROFILE --------------------
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/get-profile", authUser, getProfile);
router.put("/update-profile", authUser, upload.single("image"), updateProfile);

// -------------------- USER APPOINTMENTS --------------------
router.post("/book-appointment", authUser, bookAppointment);
router.get("/appointments", authUser, listAppointments);
router.post("/cancel-appointment", authUser, cancelAppointment);

//
router.post('/book-consultation', authUser,bookConsultation);
router.get('/consultations', authUser, listUserConsultations);

router.post('/cancel-consultation', authUser, cancelConsultation);

router.post('/join-call', authUser, patientJoinCall);
router.post('/forgot-password', forgotPasswordUser);
router.post('/reset-password/:token', resetPasswordUser);
router.post('/verify-otp', verifyOTPUser);
router.post('/verify-stripe', authUser, verifyStripe);
router.post("/place-order-stripe", authUser, placeOrderStripe);
router.post("/verify-order-stripe", authUser, verifyOrderStripe);

router.post('/add-to-cart', authUser, addToCart);
router.post('/get-cart', authUser, getUserCart);
router.post('/update-cart', authUser,  updateCart);

router.post('/orders', authUser, userOrders);
export default router;