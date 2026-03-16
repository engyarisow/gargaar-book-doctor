import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import { Users } from "lucide-react"


// ================= ADD DOCTOR =================

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body

    const imageFile = req.file

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing details",
      })
    }

    // Check image
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Doctor image is required",
      })
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      })
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      })
    }

    // Check if doctor already exists
    const existingDoctor = await doctorModel.findOne({ email })
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(
      imageFile.path,
      { resource_type: "image" }
    )

    const imageUrl = imageUpload.secure_url

    // Create doctor object
    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


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
      message: "Invalid credentials",
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
const allDoctors = async (req,res,) =>{

   try{
       const doctors = await doctorModel.find({}).select('-password')
       res.json({success:true,doctors})
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

    const doctors = await doctorModel.countDocuments();
    const patients = await userModel.countDocuments();
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors,
      appointments: appointments.length,
      patients,
      latestAppointments: appointments.slice().reverse().slice(0, 5),
    };

    res.status(200).json({ success: true, dashData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin,AppointmentCancel ,adminDashboard}