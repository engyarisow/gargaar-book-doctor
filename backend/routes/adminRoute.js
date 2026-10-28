import express from 'express'
import {
     addDoctor,
     allDoctors,
     loginAdmin,
     appointmentsAdmin,
     AppointmentCancel,
     appointmentComplete,
     adminDashboard ,
     blockDoctor,
     updateAppealStatus,
     getAppeals,
     allUsers,
     approveDoctor,
     registerHospital,
    allHospitals,
    blockHospital,
    addPharmacy,
    getAllPharmacies,
     toggleBlockPharmacy,
    getPendingDoctors,
    updateDoctorStatus,
    allConsultationsAdmin,
    getAllPharmacyOrdersAdmin,
   getSystemReport,
} from '../controllers/adminController.js'
import upload, { uploadMultiple } from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import {changeAvailability} from '../controllers/doctorController.js'

const adminRouter = express.Router()

adminRouter.post("/add-doctor", authAdmin, uploadMultiple, addDoctor);
adminRouter.post('/approve-doctor', authAdmin, approveDoctor);
//
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)
adminRouter.post('/cancel-appointment',authAdmin,AppointmentCancel)
adminRouter.post('/complete-appointment', authAdmin, appointmentComplete)
adminRouter.get('/dashboard', authAdmin, adminDashboard)

adminRouter.post('/block-doctor', authAdmin,blockDoctor )

adminRouter.get('/appeals', authAdmin,getAppeals )
adminRouter.post('/update-appeal', authAdmin, updateAppealStatus);

// users
adminRouter.get('/all-users', authAdmin, allUsers);

//hospitals
adminRouter.post("/register-hospital", authAdmin, uploadMultiple, registerHospital);
adminRouter.get('/all-hospitals', authAdmin, allHospitals);
adminRouter.post('/block-hospital', authAdmin, blockHospital);


adminRouter.post('/add-Pharmacy', authAdmin, uploadMultiple, addPharmacy);
adminRouter.get('/all-pharmacies', authAdmin, getAllPharmacies);
adminRouter.post('/toggle-block', authAdmin, toggleBlockPharmacy);

//
adminRouter.get('/pending-doctors', authAdmin, getPendingDoctors);
adminRouter.post('/change-doctor-status', authAdmin, updateDoctorStatus);


adminRouter.get('/all-consultations', authAdmin, allConsultationsAdmin);


adminRouter.get('/all-pharmacy-orders', authAdmin, getAllPharmacyOrdersAdmin);


adminRouter.get('/system-report', authAdmin, getSystemReport);

export default adminRouter