import express from 'express';
import { 
addDoctorByHospital,
 loginHospital,
 getHospitalDoctors,
 changeAvailabilityHospital,
 forgotPasswordHospital,
 verifyOTPHospital,
  resetPasswordHospital,
 getHospitalAppointments,
 appointmentCompleteHospital,
appointmentCancelHospital,
 hospitalDashboard,
 getAllHospitals,
 getHospitalConsultations,
 acceptConsultation, 
    cancelBooking,
} from '../controllers/hospitalController.js';
import upload from '../middlewares/multer.js';
import authHospital from '../middlewares/authHospital.js';

const hospitalRouter = express.Router();

hospitalRouter.post('/login', loginHospital);
hospitalRouter.post('/forgot-password', forgotPasswordHospital);
hospitalRouter.post('/verify-otp', verifyOTPHospital);
hospitalRouter.post('/reset-password/:token', resetPasswordHospital)


// Route-ka lagu darayo dhakhtarka
hospitalRouter.post('/add-doctor', authHospital, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]), addDoctorByHospital);


hospitalRouter.get('/doctors', authHospital, getHospitalDoctors);
hospitalRouter.post('/change-availability', authHospital, changeAvailabilityHospital);

hospitalRouter.get('/appointments', authHospital, getHospitalAppointments);
hospitalRouter.post('/complete-appointment', authHospital, appointmentCompleteHospital);
hospitalRouter.post('/cancel-appointment', authHospital, appointmentCancelHospital);


hospitalRouter.get('/dashboard', authHospital, hospitalDashboard);

//
hospitalRouter.get('/list', getAllHospitals);
hospitalRouter.get('/consultations', authHospital, getHospitalConsultations);

// Actions Routes
hospitalRouter.post('/accept-consultation', authHospital, acceptConsultation);
hospitalRouter.post('/cancel-booking', authHospital, cancelBooking);
export default hospitalRouter;