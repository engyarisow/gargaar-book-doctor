import express from "express";
import upload from "../middlewares/multer.js"; // <-- your multer file
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);

// Add multer middleware for file upload
userRouter.post("/update-profile", authUser, upload.single("image"), updateProfile);

userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

export default userRouter;