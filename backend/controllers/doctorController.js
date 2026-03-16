import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";


// -------------------- CHANGE DOCTOR AVAILABILITY --------------------
const changeAvailability = async (req, res) => {
  try {
    const docId = req.doc.id; // Use token
    const docData = await doctorModel.findById(docId);

    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    docData.available = !docData.available;
    await docData.save();

    res.json({ success: true, message: "Availability changed successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- GET DOCTOR LIST --------------------
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({})
      .select(["-password", "-email"]);

    res.json({ success: true, doctors });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- DOCTOR LOGIN --------------------
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- GET DOCTOR APPOINTMENTS --------------------
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.doc.id;
    const appointments = await appointmentModel.find({ docId }).sort({ date: -1 });

    res.json({ success: true, appointments });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- MARK APPOINTMENT COMPLETE --------------------
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.doc.id;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    appointmentData.isCompleted = true; // changed field name to match frontend
    await appointmentData.save();

    res.json({ success: true, message: "Appointment marked as complete" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- CANCEL APPOINTMENT --------------------
const cancelAppointmentDoctor = async (req, res) => {
  try {
    const docId = req.doc.id;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    appointmentData.cancelled = true;
    await appointmentData.save();

    // Optional: free up the slot in doctor schedule
    const doctorData = await doctorModel.findById(docId);
    if (doctorData && doctorData.slots_booked && appointmentData.slotDate) {
      doctorData.slots_booked[appointmentData.slotDate] =
        doctorData.slots_booked[appointmentData.slotDate].filter(slot => slot !== appointmentData.slotTime);
      await doctorData.save();
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ---------------- DOCTOR DASHBOARD ----------------
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.doc.id;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    appointments.forEach(item => { if (item.isCompleted || item.payment) earnings += item.amount; });

    const patientsSet = new Set();
    appointments.forEach(item => { if (item.userId) patientsSet.add(item.userId.toString()); });

    res.json({
      success: true,
      dashData: {
        earnings,
        appointments: appointments.length,
        patients: patientsSet.size,
        latestAppointments: appointments.slice(-5).reverse()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ---------------- DOCTOR PROFILE ----------------
const doctorProfile = async (req, res) => {
  try {

    const docId = req.doc.id;

    const profileData = await doctorModel
      .findById(docId)
      .select("-password");

    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      profileData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doc.id;
    const { address, fees, available, degree, experience, about } = req.body || {};

    const updateFields = {};

    // Merge address instead of replacing entirely
    if (address) {
      updateFields.address = {};
      if (address.Line1 !== undefined) updateFields.address.Line1 = address.Line1;
      if (address.Line2 !== undefined) updateFields.address.Line2 = address.Line2;
    }

    if (fees !== undefined) updateFields.fees = fees;
    if (available !== undefined) updateFields.available = available;
    if (degree !== undefined) updateFields.degree = degree;
    if (experience !== undefined) updateFields.experience = experience;
    if (about !== undefined) updateFields.about = about;

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList, loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  cancelAppointmentDoctor,
  doctorDashboard, doctorProfile,
  updateDoctorProfile
};



