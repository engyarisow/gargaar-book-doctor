import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';


// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Missing Details' });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: 'Enter a valid email' });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Missing Details' });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (address) user.address = JSON.parse(address);

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
      user.image = upload.secure_url;
    }

    await user.save();
    res.json({ success: true, message: 'Profile Updated Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id;

    if (!slotTime) return res.status(400).json({ success: false, message: 'Please select a time slot' });

    const doctor = await doctorModel.findById(docId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.available) return res.status(400).json({ success: false, message: 'Doctor not available' });

    if (!doctor.slots_booked) doctor.slots_booked = {};

    const updatedDoctor = await doctorModel.findOneAndUpdate(
      {
        _id: docId,
        $or: [
          { [`slots_booked.${slotDate}`]: { $exists: false } },
          { [`slots_booked.${slotDate}`]: { $nin: [slotTime] } }
        ]
      },
      { $push: { [`slots_booked.${slotDate}`]: slotTime } },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(400).json({ success: false, message: 'This slot is not available, please choose another' });
    }

    const user = await userModel.findById(userId).select('-password');

    const appointment = new appointmentModel({
      userId,
      docId,
      userData: user,
      docData: updatedDoctor.toObject(),
      amount: updatedDoctor.fees,
      slotTime,
      slotDate,
      date: new Date()
    });

    await appointment.save();
    res.json({ success: true, message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong during booking' });
  }
};

// LIST USER APPOINTMENTS
const listAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentModel.find({ userId }).sort({ _id: -1 });
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
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




export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, };