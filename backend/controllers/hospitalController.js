import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import hospitalModel from '../models/hospitalModel.js';
import { v2 as cloudinary } from "cloudinary";
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import consultationsModel from '../models/consultationsModel.js';
import sendEmail from '../utils/sendEmail.js';

export const loginHospital = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hospital = await hospitalModel.findOne({ email });

        if (!hospital) return res.json({ success: false, message: "Cisbitaalka lama helin!" });

        const isMatch = await bcrypt.compare(password, hospital.password);
        if (!isMatch) return res.json({ success: false, message: "Password khaldan!" });

        if (hospital.blocked) return res.json({ success: false, message: "Account-ka waa la xannibay!" });
        
        const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET);
        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//

export const forgotPasswordHospital = async (req, res) => {
    try {
        const { email } = req.body;
        const hospital = await hospitalModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!hospital) return res.json({ success: false, message: "Isbitaalkan lama helin!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        hospital.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        hospital.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await hospital.save();
        
        // --- HALKAN AYAA LAGU XIRAY SEND-EMAIL-KAAGA ---
        await sendEmail({
            email: hospital.email,
            subject: "Gargaar Portal - Hospital Password OTP",
            message: `Haye Maamulaha Isbitaalka,\n\nWaxaa la soo codsaday koodhka dib u habaynta password-ka account-kiina Gargaar Portal.\n\nKoodhkaaga xaqiijinta (OTP) waa:\n\n ${otp} \n\nKoodhkani wuxuu dhacayaa 10 daqiiqo gudahood.`
        });

        res.json({ success: true, message: "OTP ayaa email-kaaga loo diray!", email: hospital.email });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const verifyOTPHospital = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const hospital = await hospitalModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            resetPasswordToken: hashedOTP,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!hospital) return res.json({ success: false, message: "OTP waa khalad ama waqtigiisu wuu dhacay!" });

        res.json({ success: true, message: "OTP waa sax!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const resetPasswordHospital = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const hospital = await hospitalModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!hospital) return res.json({ success: false, message: "Waqtiga OTP-ga wuu dhacay!" });

        const salt = await bcrypt.genSalt(10);
        hospital.password = await bcrypt.hash(password, salt);
        hospital.resetPasswordToken = undefined;
        hospital.resetPasswordExpire = undefined;

        await hospital.save();
        res.json({ success: true, message: "Password-ka Hospital-ka si guul leh ayaa loo bedelay!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const addDoctorByHospital = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        
        
        const hospitalId = req.hospitalId; 

        if (!hospitalId) {
            return res.json({ success: false, message: "Authorization failed: hospitalId missing" });
        }

        const imageFile = req.files.image[0];
        const certificateFile = req.files.certificate[0];

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const certificateUpload = await cloudinary.uploader.upload(certificateFile.path, { resource_type: "image" });

        const doctorData = {
            name, email,
            password: await bcrypt.hash(password, 10),
            image: imageUpload.secure_url,
            certificate: certificateUpload.secure_url,
            speciality, degree, experience, about,
            fees: Number(fees),
            address: JSON.parse(address),
            ownerType: 'hospital',
            addedBy: hospitalId, // Hadda wuu helayaa ID-ga
            status: 'Pending',
            available: false,
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Dhakhtarka si guul leh ayaa loo diiwaangeliyey!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const getHospitalDoctors = async (req, res) => {
    try {
        const hospitalId = req.hospitalId; 
        
        
        const doctors = await doctorModel.find({ addedBy: hospitalId });

        res.json({ success: true, doctors });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
//
export const changeAvailabilityHospital = async (req, res) => {
    try {
        const { docId } = req.body;
        const hospitalId = req.hospitalId; 

        
        const docData = await doctorModel.findOne({ _id: docId, addedBy: hospitalId });

        if (!docData) {
            return res.json({ 
                success: false, 
                message: "Dhakhtarka lama helin ama ma haysatid oggolaansho!" 
            });
        }

        
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        res.json({ success: true, message: "Availability-ga si guul leh ayaa loo beddelay!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
// Get all appointments for doctors belonging to a specific hospital
export const getHospitalAppointments = async (req, res) => {
    try {
        const hospitalId = req.hospitalId;

        // 1. Find all doctors added by this hospital
        const doctors = await doctorModel.find({ addedBy: hospitalId });
        
        // 2. Extract just the IDs into an array
        const doctorIds = doctors.map(doc => doc._id);

        // 3. Find appointments where the docId is in our doctorIds array
        // We populate 'docData' and 'userData' to show details in the frontend
        const appointments = await appointmentModel.find({ docId: { $in: doctorIds } })
            .populate('docId', 'name image speciality') 
            .populate('userId', 'name email phone');

        res.json({ success: true, appointments: appointments.reverse() });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
export const appointmentCompleteHospital = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        // Verify appointment exists
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }
        // Update status
        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
        res.json({ success: true, message: "Appointment Completed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
export const appointmentCancelHospital = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Ballanta lama helin" });
        }

        // Update status to cancelled
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        res.json({ success: true, message: "Ballanta waa la baajiyey (Cancelled)" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}



export const hospitalDashboard = async (req, res) => {
    try {
        const hospitalId = req.hospitalId;

        // 1. Hel dhakhaatiirta (hubi haddii ay yihiin String ama ObjectId)
        const doctors = await doctorModel.find({ addedBy: hospitalId });
        // Waxaan u beddelaynaa docIds-ka ObjectId si ay ula jaanqaado Schema-haaga
        const docIds = doctors.map(doc => doc._id);

        // 2. Fetch records
        const hospitalAppointments = await appointmentModel.find({ docId: { $in: docIds.map(id => id.toString()) } });
        const videoConsultations = await consultationsModel.find({ doctorId: { $in: docIds } });

        // 3. Calculation Logic
        let hospitalEarnings = 0;
        let videoEarnings = 0;
        const patientsSet = new Set();

        // Clinic Apps
        hospitalAppointments.forEach(app => {
            if (app.isCompleted === true && app.cancelled !== true) {
                hospitalEarnings += Number(app.amount || 0);
                if (app.userId) patientsSet.add(app.userId.toString());
            }
        });

        // Video Consultations (Isticmaal status: 'completed' ama isCompleted: true)
        videoConsultations.forEach(con => {
            const isCompleted = con.isCompleted === true || con.status === 'completed' || con.status === 'follow-up';
            if (isCompleted && con.cancelled !== true) {
                videoEarnings += Number(con.amount || 0);
                if (con.patientId) patientsSet.add(con.patientId.toString());
            }
        });

        // 4. Latest Bookings
        const latestAppointments = [
            ...hospitalAppointments.map(a => ({ ...a._doc, type: 'hospital' })),
            ...videoConsultations.map(c => ({ ...c._doc, type: 'consultation' }))
        ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

        res.json({
            success: true,
            dashData: {
                totalEarnings: hospitalEarnings + videoEarnings,
                hospitalEarnings,
                consultationEarnings: videoEarnings,
                patients: patientsSet.size,
                hospitalAppointments: hospitalAppointments.filter(i => i.isCompleted && !i.cancelled).length,
                totalConsultations: videoConsultations.filter(i => (i.isCompleted || i.status === 'completed') && !i.cancelled).length,
                doctors: doctors.length,
                latestAppointments
            }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Function to get all hospitals for the public
export const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await hospitalModel.find({}).select("-password");

        res.json({
            success: true,
            hospitals
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: 'Server Error: Wax baa khaldamay',
            error: error.message
        });
    }
};
// Get all video consultations for doctors under this hospital
export const getHospitalConsultations = async (req, res) => {
    try {
        const hospitalId = req.hospitalId;

        // 1. Hel dhammaan dhakhaatiirta hoos timaada hospital-kan
        const doctors = await doctorModel.find({ addedBy: hospitalId, ownerType: 'hospital' });
        const docIds = doctors.map(doc => doc._id);

        // 2. La soo bax consultations-ka ay leeyihiin dhakhaatiirtan, kuna sifee patientId
        const consultations = await consultationsModel.find({ 
            doctorId: { $in: docIds } 
        })
        .populate('patientId', 'name image dob gender email phone') // Halkan waxaa loo beddelay patientId
        .populate('doctorId', 'name image speciality'); // Halkan waxaa loo beddelay doctorId si uu ugu dalo koodhkaaga sare

        // Maadaama .sort({ createdAt: -1 }) uu backend-ka ku jiri karo, halkan ayaan ku habaynaynaa
        const sortedConsultations = consultations.reverse();

        res.json({ success: true, consultations: sortedConsultations });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Accept Consultation
export const acceptConsultation = async (req, res) => {
    try {
        const { consultationId } = req.body;
        const consultation = await consultationsModel.findByIdAndUpdate(
            consultationId, 
            { status: 'scheduled' }, // Beddel status-ka
            { new: true }
        );
        res.json({ success: true, message: "Consultation Accepted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Cancel Consultation/Appointment
export const cancelBooking = async (req, res) => {
    try {
        const { id, type } = req.body; // type: 'hospital' ama 'consultation'
        if (type === 'consultation') {
            await consultationsModel.findByIdAndUpdate(id, { cancelled: true, status: 'cancelled' });
        } else {
            await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
        }
        res.json({ success: true, message: "Booking Cancelled" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};