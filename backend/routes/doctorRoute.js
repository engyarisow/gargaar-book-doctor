// backend/routes/doctorRoute.js
import express from "express";
import {
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  cancelAppointmentDoctor,
  changeAvailability,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile 
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/appointment-complete", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, cancelAppointmentDoctor);
doctorRouter.post("/change-availability", authDoctor, changeAvailability);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor,  doctorProfile  );
doctorRouter.put("/update-profile", authDoctor, updateDoctorProfile);




export default doctorRouter;