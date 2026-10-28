import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import logModel from "../models/logModel.js";
import appealModel from "../models/appealModel.js"; 
import hospitalModel from "../models/hospitalModel.js";
import pharmacyModel from '../models/pharmacyModel.js';
import consultationsModel from "../models/consultationsModel.js";
import orderModel from "../models/orderModel.js";
import Post from '../models/post.js';

// ================= ADD DOCTOR =================
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        
        const imageFile = req.files && req.files.image ? req.files.image[0] : null;
        const certificateFile = req.files && req.files.certificate ? req.files.certificate[0] : null;

        if (!imageFile || !certificateFile) {
            return res.status(400).json({ success: false, message: "Fadlan soo geli sawirka iyo shahaadada labadaba" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const certificateUpload = await cloudinary.uploader.upload(certificateFile.path, { resource_type: "auto" });

        const doctorData = {
            name,
            email,
            password: await bcrypt.hash(password, 10),
            image: imageUpload.secure_url,
            certificate: certificateUpload.secure_url, 
            speciality,
            degree,
            experience: experience || "1 Year",
            about,
            fees: Number(fees),
            address: typeof address === 'string' ? JSON.parse(address) : address,
            date: Date.now(),
            
            // 100% Secure & Clean Logic
            ownerType: 'admin', 
            // FIIRO GAAR AH: addedBy meesha waan ka saarnay maadaama Admin darayo!
            status: 'Approved',
            available: true 
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor Added Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ================= ADMIN LOGIN =================

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      )

      return res.status(200).json({
        success: true,
        token,
      })
    }

    res.status(401).json({
      success: false,
      message: "Aqoonsi aan sax ahayn",
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// api to  get alldoctor list for admin panel
const allDoctors = async (req, res) => {
    try {
        // Waxaan isticmaaleynaa .populate('addedBy') si aan u helno magaca Clinic/Hospital
        // sidoo kale waxaan soo qaadeynaa 'addedByModel' si aan u ogaano nooca (Type)
        const doctors = await doctorModel.find({})
            .select('-password')
            .populate('addedBy', 'name') // Tan waxay soo qaadaysaa magaca meeshii lagu daray

        res.json({ success: true, doctors })
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointment list
const appointmentsAdmin = async(req,res) =>{

  try {

    const appointments = await appointmentModel.find({})
    res.json({success:true,appointments})
  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
    
  }
}
 export const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body
        
        // Find appointment and update status
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

        res.json({ success: true, message: "Appointment Completed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// CANCEL APPOINTMENT
const AppointmentCancel = async (req, res) => {
  try {
   
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    

    // Cancel appointment
    appointmentData.cancelled = true;
    await appointmentData.save();

    // Free doctor's slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    if (doctorData && doctorData.slots_booked[slotDate]) {
      doctorData.slots_booked[slotDate] = doctorData.slots_booked[slotDate].filter(slot => slot !== slotTime);
      await doctorData.save();
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
// API to get admin dashboardPanel
const adminDashboard = async (req, res) => {
  try {
    // Counts (Tirakoobka guud)
    const doctors = await doctorModel.countDocuments();
    const patients = await userModel.countDocuments();
    const hospitals = await hospitalModel.countDocuments();
    const pharmacies = await pharmacyModel.countDocuments();

    // Data Fetching (Xogta ballamaha iyo dalabaadka)
    const appointments = await appointmentModel.find({});
    const consultations = await consultationsModel.find({});
    const orders = await orderModel.find({}); 

    // Completed & Not Cancelled Appointments
    const completedAppointments = appointments.filter(
      (appt) => appt.isCompleted === true && appt.cancelled === false
    );

    // Completed & Not Cancelled Consultations
    const completedConsultations = consultations.filter(
      (cons) => cons.isCompleted === true && cons.cancelled === false
    );

    // 🚀 HALKAN WAA LA SAXAY: Waxaa lagu beddelay 'orderStatus' si uu ula mid noqdo database-ka
    const deliveredOrders = orders.filter(
      (order) => order.orderStatus && order.orderStatus.toLowerCase() === 'delivered'
    );

    // Revenue Calculations (Xisaabinta Dakhliga)
    const apptRevenue = completedAppointments.reduce(
      (total, appt) => total + (Number(appt.amount) || 0),
      0
    );

    const consRevenue = completedConsultations.reduce(
      (total, cons) => total + (Number(cons.amount) || 0),
      0
    );

    // 🚀 HALKAN WAA LA SAXAY: Waxaa lagu daray 'pharmacyPayoutAmount' iyo 'totalAmount'
    const ordersRevenue = deliveredOrders.reduce(
      (total, order) => total + (Number(order.totalAmount) || Number(order.pharmacyPayoutAmount) || Number(order.amount) || 0),
      0
    );

    // Total Revenue (Isu geynta guud)
    const totalRevenue = apptRevenue + consRevenue + ordersRevenue;

    // Done Counts & Total Orders
    const doneAppointments = completedAppointments.length;
    const doneConsultations = completedConsultations.length;
    const totalOrders = orders.length; // Tirada dalabaadka oo dhan (Pending, Delivered, Cancelled)

    // Latest Bookings (10-ka ugu dambeeya ee Appts & Cons)
    const combinedBookings = [
      ...appointments.map((a) => ({
        ...a.toObject(),
        bookingType: "Appointment",
      })),
      ...consultations.map((c) => ({
        ...c.toObject(),
        bookingType: "Consultation",
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      .slice(0, 10);

    const dashData = {
      hospitals,
      pharmacies, 
      doctors,
      patients,

      // Totals
      appointments: appointments.length,
      consultations: consultations.length,
      totalOrders, 

      // Completed
      doneAppointments,
      doneConsultations,

      // Revenue
      apptRevenue,
      consRevenue,
      ordersRevenue, 
      totalRevenue,  

      // Latest Bookings
      latestBookings: combinedBookings,
    };

    res.status(200).json({
      success: true,
      dashData,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// block doc
const blockDoctor = async (req, res) => {
  try {
    const { docId, reason } = req.body;

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const isBlocking = !doctor.blocked;
    
    // Toggle status
    doctor.blocked = isBlocking;
    
    // ⚡ Logic for Reason:
    // If blocking: Use provided reason or default
    // If unblocking: Use provided reason (e.g., "Verification complete") or clear it
    doctor.blockReason = reason || (isBlocking ? "No specific reason provided" : "Account reactivated by admin");
    doctor.blockedAt = isBlocking ? new Date() : null;

    await doctor.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("doctor-blocked-status", {
        docId: docId,
        blocked: isBlocking,
        reason: doctor.blockReason,
        message: isBlocking 
          ? `Gargaar: Account-kaaga waa la xanibay. Sababta: ${doctor.blockReason}` 
          : `Gargaar: Account-kaaga waa la furay. Fariinta: ${doctor.blockReason}`
      });
    }

    return res.json({
      success: true,
      message: isBlocking ? "Doctor blocked successfully" : "Doctor unblocked successfully",
      reason: doctor.blockReason,
      blocked: isBlocking
    });

  } catch (error) {
    console.error("Block/Unblock Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Get all appeals for Admin
const getAppeals = async (req, res) => {
  try {
    // Changed 'specialities' to 'speciality' to match your doctorModel
    const appeals = await appealModel.find({})
      .populate('doctorId', 'name email speciality image'); 
    
    res.json({ success: true, appeals });
  } catch (error) {
    console.error("Get Appeals Error:", error); // This logs the real error to your terminal
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Reject Appeal
const updateAppealStatus = async (req, res) => {
  try {
    const { appealId, status } = req.body; 
    const appeal = await appealModel.findById(appealId);
    
    if (!appeal) return res.status(404).json({ success: false, message: "Appeal not found" });

    // 1. Update the appeal status
    appeal.status = status; // "approved" or "rejected"
    await appeal.save();

    // 2. If approved, unblock the doctor AND clear the "pending" state for future blocks
    if (status === "approved") {
      await doctorModel.findByIdAndUpdate(appeal.doctorId, { 
        blocked: false, 
        blockReason: "" 
      });
      
      // OPTIONAL: Delete the appeal so the doctor can appeal again if blocked next month
      // await appealModel.findByIdAndDelete(appealId); 
    }

    res.json({ success: true, message: `Appeal ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// API to get all users list for admin panel
const allUsers = async (req, res) => {
    try {
        // Find all users and exclude the password field for security
        const users = await userModel.find({}).select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            users 
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
// aprove
const approveDoctor = async (req, res) => {
  try {
    const { docId, status } = req.body; // status waxay noqon kartaa 'approved' ama 'rejected'
    await doctorModel.findByIdAndUpdate(docId, { status, available: status === 'approved' });
    res.json({ success: true, message: `Dhakhtarka hadda waa ${status}` });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// API to register a new hospital/clinic by Super Admin
const registerHospital = async (req, res) => {
    try {
        const { name, email, password, location, about, speciality } = req.body;
        
        // Hubi fayllada (Files check)
        const logoFile = req.files.image[0]; // Waxaan u isticmaalaynaa field-ka 'image'
        const licenseFile = req.files.certificate[0]; // Waxaan u isticmaalaynaa field-ka 'certificate'

        if (!logoFile || !licenseFile) {
            return res.json({ success: false, message: "Fadlan soo geli Logo-ga iyo License-ka" });
        }

        // Hash-garee password-ka ay cisbitaalku ku geli doonaan panel-kooda
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload to Cloudinary
        const logoUpload = await cloudinary.uploader.upload(logoFile.path, { resource_type: "image" });
        const licenseUpload = await cloudinary.uploader.upload(licenseFile.path, { resource_type: "image" });

        const hospitalData = {
            name,
            email,
            password: hashedPassword,
            logo: logoUpload.secure_url,
            license: licenseUpload.secure_url,
            location,
            about,
            speciality: JSON.parse(speciality),
            date: Date.now()
        };

        const newHospital = new hospitalModel(hospitalData);
        await newHospital.save();

        res.json({ success: true, message: "Hospital/Clinic registered successfully!" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
const allHospitals = async (req, res) => {
    try {
        const hospitals = await hospitalModel.find({}).select("-password"); // Password-ka ha soo celin
        res.json({ success: true, hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const blockHospital = async (req, res) => {
    try {
        // 1. Ka soo saar ID-ga body-ga (waa muhiim req.body)
        const { hospitalId } = req.body;

        if (!hospitalId) {
            return res.status(400).json({ success: false, message: "Hospital ID is required" });
        }

        const hospital = await hospitalModel.findById(hospitalId);
        
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }

        // 2. Toggle blocked status
        const newStatus = !hospital.blocked;
        await hospitalModel.findByIdAndUpdate(hospitalId, { blocked: newStatus });

        res.json({ 
            success: true, 
            message: newStatus ? "Cisbitaalka waa la xannibay" : "Cisbitaalka waa la fasaxay" 
        });

    } catch (error) {
        console.error(error); // Tani waxay terminal-ka ku tusaysaa haddii crash dhaco
        res.status(500).json({ success: false, message: error.message });
    }
};
// API: Add 
const addPharmacy = async (req, res) => {
    try {
        // 📦 1. Helitaanka Xogta Cusub ee Form-ka
        const { 
            name, email, password, about, contactNumber, pharmacistName,
            ceoName, holderNumber, 
            locationText, lat, lng, 
            payoutMethod, payoutAccountType, payoutAccountNumber, payoutHolderName
        } = req.body;
        
        // Helitaanka fayllada
        const imageFile = req.files && req.files.image ? req.files.image[0] : null;
        const licenseFile = req.files && req.files.certificate ? req.files.certificate[0] : null;

        // Hubinta in xogta aasaasiga ah la buuxiyay
        if (!name || !email || !password || !locationText || !lat || !lng || !contactNumber || !pharmacistName || !ceoName || !holderNumber || !payoutMethod || !payoutAccountNumber) {
            return res.json({ success: false, message: "Fadlan buuxi dhammaan meelaha muhiimka ah!" });
        }

        if (!imageFile || !licenseFile) {
            return res.json({ success: false, message: "Fadlan soo geli Sawirka Logo-ga iyo Shatiga (License)" });
        }

        // Hubinta Payout Logic (Haddii uu Personal yahay magaca waa qasab)
        if (payoutAccountType === 'Personal' && !payoutHolderName) {
            return res.json({ success: false, message: "Fadlan geli magaca milkiilaha akoonka maadaama aad dooratay Personal Account." });
        }

        // 🔒 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ☁️ 3. Upload to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const licenseUpload = await cloudinary.uploader.upload(licenseFile.path, { resource_type: "image" });

        // ⏰ 4. Abuurista Saacadaha Shaqada ee Default-ka ah (7 Maalmood)
        const defaultOperatingHours = [
            { day: 'Monday', openingTime: '08:00', closingTime: '22:00', isClosed: false },
            { day: 'Tuesday', openingTime: '08:00', closingTime: '22:00', isClosed: false },
            { day: 'Wednesday', openingTime: '08:00', closingTime: '22:00', isClosed: false },
            { day: 'Thursday', openingTime: '08:00', closingTime: '22:00', isClosed: false },
            { day: 'Friday', openingTime: '08:00', closingTime: '22:00', isClosed: false },
            { day: 'Saturday', openingTime: '08:00', closingTime: '22:00', isClosed: false },
            { day: 'Sunday', openingTime: '08:00', closingTime: '22:00', isClosed: false }
        ];

        // 🏗️ 5. Diyaarinta Xogta Farmashiyaha
        const pharmacyData = {
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url,
            license: licenseUpload.secure_url, 
            about,
            
            // Xiriirka & Maamulka
            contactNumber,
            pharmacistName,
            ceoName,
            holderNumber,

            // 📍 GeoJSON Location (FIIRO GAAR AH: MongoDB waxay u baahan tahay [Longitude, Latitude])
            locationText,
            location: {
                type: 'Point',
                coordinates: [Number(lng), Number(lat)] 
            },

            // 🏦 Payout
            payoutMethod,
            payoutAccountType,
            payoutAccountNumber,
            payoutHolderName: payoutAccountType === 'Personal' ? payoutHolderName : undefined,

            // Nidaamka Shaqada & System-ka
            operatingHours: defaultOperatingHours,
            status: 'Active', // Maadaama Admin-ku uu ku darayo, wuxuu toos noqon karaa Active
            date: Date.now()
        };

        // 💾 6. Kaydinta Database-ka
        const newPharmacy = new pharmacyModel(pharmacyData);
        await newPharmacy.save();

        res.json({ success: true, message: "Pharmacy-ga waa la diiwaangeliyey si guul leh!" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// 🚀 API: Get All Pharmacies
const getAllPharmacies = async (req, res) => {
    try {
        // Soo jiido dhammaan farmashiyeyaasha aan la tirtirin (isDeleted: false)
        const pharmacies = await pharmacyModel.find({ isDeleted: false }).select("-password");

        res.json({ 
            success: true, 
            pharmacies 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Cillad ayaa dhacday: " + error.message 
        });
    }
};


// 🚀 API: Toggle Block / Status Pharmacy
const toggleBlockPharmacy = async (req, res) => {
    try {
        const { pharmacyId } = req.body;

        if (!pharmacyId) {
            return res.json({ success: false, message: "Fadlan soo dir Pharmacy ID-ga" });
        }

        const pharmacy = await pharmacyModel.findById(pharmacyId);
        
        if (!pharmacy) {
            return res.json({ success: false, message: "Farmashiyaha lama helin" });
        }

        // Logic cusub oo la jaanqaadaya 'status' (Active vs Suspended)
        if (pharmacy.status === 'Suspended') {
            pharmacy.status = 'Active'; // Waa la furay (Unblocked)
        } else {
            pharmacy.status = 'Suspended'; // Waa la xiray (Blocked)
        }

        await pharmacy.save();

        res.json({ 
            success: true, 
            message: pharmacy.status === 'Suspended' 
                ? "Farmashiyaha si guul leh ayaa loo xannibay (Suspended)" 
                : "Farmashiyaha dib ayaa loo fasaxay (Active)" 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Cillad ayaa dhacday: " + error.message 
        });
    }
};

// 1. Soo saar dhakhaatiirta status-koodu yahay Pending
export const getPendingDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ status: 'Pending' }).populate('addedBy', 'name email');
        res.json({ success: true, doctors });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Ansixinta ama Diidmada dhakhtarka
export const updateDoctorStatus = async (req, res) => {
    try {
        const { docId, status } = req.body; // status: 'Approved' ama 'Rejected'

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.json({ success: false, message: "Status khaldan" });
        }

        const doctor = await doctorModel.findByIdAndUpdate(docId, { 
            status, 
            available: status === 'Approved' ? true : false 
        });

        res.json({ success: true, message: `Dhakhtarku hadda waa ${status}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ================= GET ALL CONSULTATIONS FOR ADMIN =================
 export const allConsultationsAdmin = async (req, res) => {
    try {
        // Waxaan soo qaadaynaa dhammaan xogta, waxaana la socda xogta Bukaanka iyo Dhakhtarka
        const consultations = await consultationsModel.find({})
            .populate('patientId', 'name email image')
            .populate('doctorId', 'name email image speciality')
            .sort({ createdAt: -1 }); // Kuwa ugu dambeeyay ha ugu horreeyaan

        // Waxaan dhisaynaa xog dheeraad ah si frontend-ku si fudud ugu ogaado attendance-ka (cidda timid)
        const formattedConsultations = consultations.map(consultation => {
            const docJoined = !!consultation.videoSession?.doctorJoinedAt;
            const ptJoined = !!consultation.videoSession?.patientJoinedAt;
            
            let attendanceStatus = "Cidna may iman";
            if (docJoined && ptJoined) attendanceStatus = "Labaduba way yimaadeen";
            else if (docJoined && !ptJoined) attendanceStatus = "Dhakhtarka ayaa yimid";
            else if (!docJoined && ptJoined) attendanceStatus = "Bukaanka ayaa yimid";

            return {
                ...consultation._doc, // Xogtii asalka ahayd ee database-ka
                attendance: {
                    doctorJoined: docJoined,
                    patientJoined: ptJoined,
                    statusText: attendanceStatus,
                    doctorJoinedAt: consultation.videoSession?.doctorJoinedAt || null,
                    patientJoinedAt: consultation.videoSession?.patientJoinedAt || null
                }
            };
        });

        res.status(200).json({ 
            success: true, 
            consultations: formattedConsultations 
        });

    } catch (error) {
        console.error("All Consultations Admin Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET ALL PHARMACY ORDERS FOR ADMIN =================
// ==========================================
// ALL PHARMACY ORDERS FOR ADMIN (FIXED CONTACT & NOTES)
// ==========================================
export const getAllPharmacyOrdersAdmin = async (req, res) => {
    try {
        // Waxaan hubinaynaa in 'phone' iyo 'contactNumber' labadaba lasoo jiido (populate)
        const orders = await orderModel.find({})
            .populate('userId', 'name contactNumber phone email image profileImage')
            .populate('pharmacyId', 'name contactNumber locationText image profileImage logo')
            .populate('items.medicineId', 'name image price')
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => {
            const cleanImage = (img) => {
                if (!img || img === '...' || img.trim() === '') return null;
                return img;
            };

            const patientImg = cleanImage(order.userId?.image) || cleanImage(order.userId?.profileImage);
            const pharmacyImg = cleanImage(order.pharmacyId?.image) || cleanImage(order.pharmacyId?.logo) || cleanImage(order.pharmacyId?.profileImage);

            return {
                orderId: order._id,
                patient: {
                    name: order.userId?.name || order.address?.name || order.patientName || 'N/A',
                    
                    // 📞 HALKAN WAA LA SAXAY: Nambarka waxaa laga raadinayaa Address-ka, Profile-ka, iyo Order-ka laftiisa
                    contact: order.address?.phone || order.address?.contactNumber || order.deliveryAddress?.phone || order.userId?.contactNumber || order.userId?.phone || order.contactNumber || order.phone || 'N/A',
                    
                    email: order.userId?.email || 'N/A',
                    image: patientImg
                },
                pharmacy: {
                    name: order.pharmacyId?.name || 'N/A',
                    contact: order.pharmacyId?.contactNumber || 'N/A',
                    image: pharmacyImg
                },
                location: order.deliveryAddress?.location || order.address?.location || order.locationText || order.pharmacyId?.locationText || 'N/A',
                medications: order.items || order.medications || [],
                description: order.address?.notes || order.deliveryAddress?.notes || order.note || order.notes || order.description || 'No note',
                total: order.totalAmount || order.total || 0,
                status: order.orderStatus || order.status || 'Pending',
                createdAt: order.createdAt
            };
        });

        res.status(200).json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET SYSTEM REPORT (DASHBOARD) =================
export const getSystemReport = async (req, res) => {
    try {
        const { type, searchId } = req.query;

        if (!type || !searchId) {
            return res.status(400).json({ success: false, message: "Fadlan soo dir Type iyo Search ID" });
        }

        let reportData = null;

        // 1. DOCTOR REPORT
        if (type === 'doctor') {
            // Halkan waxaad bedeli kartaa '_id' haddii ID-ga dhakhtarka ee la raadinayo yahay mid custom ah sida 'DOC-123'
            const appointments = await appointmentModel.find({ docId: searchId });
            const consultations = await consultationsModel.find({ doctorId: searchId });

            const calcStats = (data) => {
                let completed = 0, pending = 0, cancelled = 0, revenue = 0;
                data.forEach(item => {
                    if (item.isCompleted) { completed++; revenue += Number(item.amount || 0); }
                    else if (item.cancelled) cancelled++;
                    else pending++;
                });
                return { completed, pending, cancelled, revenue };
            };

            const apptStats = calcStats(appointments);
            const consStats = calcStats(consultations);

            reportData = {
                revenue: apptStats.revenue + consStats.revenue,
                totalAppointments: appointments.length + consultations.length,
                physicalAppointments: { completed: apptStats.completed, pending: apptStats.pending, cancelled: apptStats.cancelled },
                videoConsultations: { completed: consStats.completed, pending: consStats.pending, cancelled: consStats.cancelled }
            };
        } 
        
        // 2. PATIENT (USER) REPORT
        else if (type === 'user') {
            const appointments = await appointmentModel.find({ userId: searchId });
            const consultations = await consultationsModel.find({ patientId: searchId });
            const orders = await orderModel.find({ userId: searchId });

            const countStatus = (data) => {
                let completed = 0, pending = 0, cancelled = 0;
                data.forEach(item => {
                    if (item.isCompleted || (item.orderStatus && item.orderStatus.toLowerCase() === 'delivered')) completed++;
                    else if (item.cancelled || (item.orderStatus && item.orderStatus.toLowerCase() === 'cancelled')) cancelled++;
                    else pending++;
                });
                return { completed, pending, cancelled };
            };

            reportData = {
                doctorAppointments: countStatus(appointments),
                videoConsultations: countStatus(consultations),
                pharmacyOrders: countStatus(orders)
            };
        } 
        
        // 3. PHARMACY REPORT
        else if (type === 'pharmacy') {
            const orders = await orderModel.find({ pharmacyId: searchId });
            
            let completed = 0, pending = 0, cancelled = 0, revenue = 0;
            
            orders.forEach(order => {
                if (order.orderStatus && order.orderStatus.toLowerCase() === 'delivered') {
                    completed++;
                    revenue += Number(order.totalAmount || order.pharmacyPayoutAmount || order.amount || 0);
                }
                else if (order.orderStatus && order.orderStatus.toLowerCase() === 'cancelled') {
                    cancelled++;
                } else {
                    pending++;
                }
            });

            reportData = {
                revenue,
                totalOrders: orders.length,
                pharmacyOrders: { completed, pending, cancelled }
            };
        }

        // 4. HOSPITAL REPORT (Tusaale ahaan)
        else if (type === 'hospital') {
            // Soo hel dhakhaatiirta cisbitaalkan ku xiran
            const doctors = await doctorModel.find({ addedBy: searchId });
            const doctorIds = doctors.map(doc => doc._id);

            const appointments = await appointmentModel.find({ docId: { $in: doctorIds } });
            
            let completed = 0, pending = 0, cancelled = 0, revenue = 0;
            appointments.forEach(item => {
                if (item.isCompleted) { completed++; revenue += Number(item.amount || 0); }
                else if (item.cancelled) cancelled++;
                else pending++;
            });

            reportData = {
                revenue,
                activeDoctors: doctors.length,
                hospitalAppointments: { completed, pending, cancelled },
                videoConsultations: { completed: 0, pending: 0, cancelled: 0 } // Waad ku dari kartaa haddii cisbitaalku leeyahay consultations
            };
        }

        if (!reportData) {
            return res.status(404).json({ success: false, message: "Xogta lama helin" });
        }

        res.status(200).json(reportData);

    } catch (error) {
        console.error("Report Generation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};





export { 
  addDoctor,
   loginAdmin, 
   allDoctors,
    appointmentsAdmin,
    AppointmentCancel ,
    adminDashboard,
    blockDoctor,
    getAppeals,
    updateAppealStatus,
    allUsers,
  approveDoctor,
  registerHospital,
  allHospitals,
  blockHospital,
   addPharmacy,
  getAllPharmacies,
 toggleBlockPharmacy,
}