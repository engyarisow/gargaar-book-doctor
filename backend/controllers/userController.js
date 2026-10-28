import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import Post from '../models/Post.js';
import cloudinary from "../config/cloudinary.js"; 
import consultationsModel from '../models/consultationsModel.js';
import orderModel from "../models/orderModel.js";
import pharmacyModel from "../models/pharmacyModel.js";
import productModel from "../models/productModel.js";
import Message from '../models/MessageModel.js';
import crypto from "crypto";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import nodemailer from 'nodemailer';
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

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;
    user.address = req.body.address ? JSON.parse(req.body.address) : user.address;

    // Update image if uploaded
   if (req.file?.path) {
  const uploadRes = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
  user.image = uploadRes.secure_url;
}

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// -------------------- BOOK APPOINTMENT (CLINIC) --------------------
// -------------------- BOOK APPOINTMENT (CLINIC) --------------------
 const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id;

    const doctor = await doctorModel.findById(docId).select('-password');
    if (!doctor || !doctor.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    // Hubi in waqtigaan la xafiday (Lock)
    const currentTime = Date.now();
    const reservationExpiry = doctor.reservedSlots?.[slotDate]?.[slotTime];
    if (reservationExpiry && reservationExpiry > currentTime) {
      return res.json({ success: false, message: "Waqtigan qof kale ayaa hadda iibsanaya." });
    }

    // Hubi in si rasmi ah loo iibsaday
    if (doctor.slots_booked?.[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Waqtigan horay ayaa loo qabsaday." });
    }

    // 🔒 SAACADDA QARSO (Kumeel-gaadh) SI QOFKALE UUSAN U GUJIN
    await doctorModel.findByIdAndUpdate(docId, {
      $set: { [`reservedSlots.${slotDate}.${slotTime}`]: Date.now() + 10 * 60 * 1000 }
    });

    // 🚀 DATABASE-KA WAXBA KUMA DARAYNO! TOOS STRIPE AYAAN U AADAYNAA
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Dr. ${doctor.name}`, description: `${slotDate} | ${slotTime}` },
          unit_amount: doctor.fees * 100
        },
        quantity: 1
      }],
      // XOGTA HALKAN AYAAN KU DARSANAYNAA SI AAN DIB UGU SOO CESHAANO
      metadata: { docId, userId, slotDate, slotTime, type: "appointment" },
     success_url: `${process.env.FRONTEND_URL}/verify-payment?success=true&session_id={CHECKOUT_SESSION_ID}&type=appointment`,
      cancel_url: `${process.env.FRONTEND_URL}/verify-payment?success=false`
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- SECURE VERIFY STRIPE --------------------
export const verifyStripe = async (req, res) => {
  try {
    const { session_id, success, type } = req.body;

    if (success === "true") {
      // 1. Kasoo soo cesho xogtii metadata ee Stripe session-ka
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const { docId, userId, slotDate, slotTime } = session.metadata;

      const doctorData = await doctorModel.findById(docId).select("-password");
      const userData = await userModel.findById(userId).select("-password");

      // ==========================================
      // 🟢 WADDADA 1AAD: VIDEO CONSULTATION
      // ==========================================
      if (type === 'consultation') {
        
        // Hubi in consultation-kan horay loo bixiyay
        const consultationExists = await consultationsModel.findOne({ 
          doctorId: docId, slotDate, slotTime, payment: true 
        });
        
        if (consultationExists) {
          return res.json({ success: false, message: "La-talintan horay ayaa loo diiwangeliyay." });
        }

        // Diyaari xogta Consultation-ka (U fiirso: patientId & doctorId)
        const consultationData = {
          patientId: userId,
          doctorId: docId,
          slotDate,
          slotTime,
          userData,
          docData: doctorData,
          amount: session.amount_total / 100,
          payment: true,
          isCompleted: false,
          status: 'scheduled' // Default status
        };

        const newConsultation = new consultationsModel(consultationData);
        await newConsultation.save();

      } 
      // ==========================================
      // 🔵 WADDADA 2AAD: IN-PERSON APPOINTMENT
      // ==========================================
      else {
        
        // Hubi in appointment-kan horay loo bixiyay
        const appointmentExists = await appointmentModel.findOne({ 
          docId, slotDate, slotTime, payment: true 
        });
        
        if (appointmentExists) {
          return res.json({ success: false, message: "Ballantan horay ayaa loo diiwangeliyay." });
        }

        // Abuur PIN-ka Sirta ah ee Muran-Bixiyaha
        const meetingPin = Math.floor(1000 + Math.random() * 9000).toString();

        // Diyaari xogta Appointment-ka (U fiirso: userId & docId)
        const appointmentData = {
          userId,
          docId,
          slotDate,
          slotTime,
          userData,
          docData: doctorData,
          amount: session.amount_total / 100,
          payment: true,
          meetingPin, 
          isPinVerified: false,
          isCompleted: false
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // 📧 DIRISTA EMAIL-KA XAQIIJINTA (Kaliya Appointment ayaa loo dirayaa)
        try {
          const transporter = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
              user: process.env.EMAIL_USER, 
              pass: process.env.EMAIL_PASS  
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          const mailOptions = {
            from: `"Gargaar" <${process.env.EMAIL_USER}>`,
            to: userData.email,
            subject: '🔒 Code-ka Xaqiijinta Kulanka (Meeting PIN) - Gargaar',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <img src="cid:gargaarLogo" alt="Gargaar Logo" style="width: 40px; height: 40px; vertical-align: middle; display: inline-block; border-radius: 12px;" />
                    <span style="display: inline-block; vertical-align: middle; font-size: 26px; font-weight: 700; color: #2563eb; margin-left: 12px;">Gargaar</span>
                  </div>
                  
                  <h2 style="color: #0f172a; text-align: center; margin-top: 0; font-size: 22px; font-weight: 700; margin-bottom: 8px;">
                    Ballantaadii Xarunta Caafimaadka Waa La Diyaariyay!
                  </h2>
                  <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 24px;">
                    Lacagtaadii waa la hubiyay, booskaaguna waa kuu diyaar.
                  </p>
                  
                  <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                      <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 35%;">👨‍⚕️ Dhakhtarka:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${doctorData.name}</td></tr>
                      <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">📅 Taariikhda:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${slotDate}</td></tr>
                      <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">⏰ Saacadda:</td><td style="padding: 6px 0; color: #2563eb; font-weight: 700;">${slotTime}</td></tr>
                    </table>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 14px; text-align: center; border: 2px dashed #cbd5e1; margin-bottom: 28px;">
                    <span style="font-size: 12px; color: #2563eb; display: block; margin-bottom: 10px; font-weight: 700; text-transform: uppercase;">Code-ka Xaqiijinta Kulanka</span>
                    <strong style="font-size: 36px; color: #1e1b4b; letter-spacing: 12px; font-family: monospace; background: #ffffff; padding: 8px 20px; border: 1px solid #e2e8f0; border-radius: 8px; display: inline-block;">${meetingPin}</strong>
                  </div>
                  
                </div>
              </div>
            `,
            attachments: [
              {
                filename: 'Gargaar.jpg',
                path: './assets/Gargaar.jpg',
                cid: 'gargaarLogo'
              }
            ]
          };

          await transporter.sendMail(mailOptions);
          console.log(`Email xaqiijin ah ayaa loo diray: ${userData.email}`);
        } catch (emailError) {
          console.error("Cilad ayaa ka dhacday dirista Email-ka:", emailError.message);
        }
      }

      // ==========================================
      // 🔒 XIRISTA BOOSKA DHAKHTARKA (Labada Noocba Way Wadaan)
      // ==========================================
      let slots_booked = doctorData.slots_booked || {};
      if (!slots_booked[slotDate]) {
        slots_booked[slotDate] = [];
      }
      slots_booked[slotDate].push(slotTime);
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });

      // ==========================================
      // ✅ U DIR JAWAABTA FRONTEND-KA
      // ==========================================
      res.json({ 
        success: true, 
        message: type === 'consultation' 
          ? "La-talinta muuqaalka ah si guul leh ayaa loo qabtay!" 
          : "Ballanta si guul leh ayaa loo qabtay! Email xaqiijin ahna waa laguugu diray." 
      });

    } else {
      res.json({ success: false, message: "Lacag bixinta waa la joojiyay." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// -------------------- GET USER APPOINTMENTS --------------------
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentModel.find({ userId });

    const now = new Date();

    // Ku dhex maamul xaaladda waqtiga halkan
    const updatedAppointments = appointments.map((item) => {
      const appObj = item.toObject();

      let isTimePassed = false;
      try {
        const formattedDateStr = item.slotDate.replace(/_/g, '/');
        const appTime = new Date(`${formattedDateStr} ${item.slotTime}`);
        isTimePassed = appTime < now;
      } catch (e) {
        isTimePassed = false;
      }

      // Xeerarka Xaaladda (Status Logic)
      if (item.cancelled) {
        appObj.customStatus = "Cancelled";
      } else if (item.isCompleted) {
        if (isTimePassed) {
          appObj.customStatus = "Completed";
        } else {
          appObj.customStatus = "Accepted";
        }
      } else {
        appObj.customStatus = "Active";
      }

      return appObj;
    });

    res.json({ success: true, appointments: updatedAppointments });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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

//
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or unauthorized'
      });
    }

    // 1. Update appointment state (CLEAN)
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      isCompleted: false,
      payment: false,
      status: "cancelled" // optional but recommended
    });

    const { docId, slotDate, slotTime } = appointmentData;

    // 2. SAFE SLOT RELEASE (NO MANUAL MUTATION)
    await doctorModel.findByIdAndUpdate(docId, {
      $pull: {
        [`slots_booked.${slotDate}`]: slotTime
      }
    });

    return res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};


// -------------------- BOOK CONSULTATION (ONLINE) --------------------
export const bookConsultation = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id;

    const doctor = await doctorModel.findById(docId).select('-password');
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    const currentTime = Date.now();
    const reservationExpiry = doctor.reservedSlots?.[slotDate]?.[slotTime];
    if (reservationExpiry && reservationExpiry > currentTime) {
      return res.json({ success: false, message: "Waqtigan qof kale ayaa hadda iibsanaya." });
    }

    if (doctor.slots_booked?.[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Waqtigan horay ayaa loo qabsaday." });
    }

    // 🔒 SAACADDA QARSO
    await doctorModel.findByIdAndUpdate(docId, {
      $set: { [`reservedSlots.${slotDate}.${slotTime}`]: Date.now() + 10 * 60 * 1000 }
    });

    // 🚀 TOOS STRIPE AYAAN U AADAYNAA
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Online Consultation - Dr. ${doctor.name}` },
          unit_amount: doctor.fees * 100,
        },
        quantity: 1,
      }],
      metadata: { docId, userId, slotDate, slotTime, type: "consultation" },
      success_url: `${process.env.FRONTEND_URL}/verify-payment?success=true&session_id={CHECKOUT_SESSION_ID}&type=consultation`,
      cancel_url: `${process.env.FRONTEND_URL}/verify-payment?success=false`,
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// -------------------- LIST USER CONSULTATIONS --------------------
export const listUserConsultations = async (req, res) => {
  try {
    const userId = req.user.id;
    const consultations = await consultationsModel
      .find({ patientId: userId })
      .populate("doctorId", "name image specialization")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, consultations });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- CANCEL CONSULTATION --------------------
export const cancelConsultation = async (req, res) => {
    try {
        const { consultationId } = req.body;
        const userId = req.user.id; 

        const consultation = await consultationsModel.findById(consultationId);

        if (!consultation || consultation.patientId.toString() !== userId) {
            return res.status(404).json({ success: false, message: 'Ballanta lama heli karo' });
        }

        // 🔥 PROTECT ACTIVE SESSIONS
        // Bukaanku ma kansali karo haddii uu session-ku bilaabmay (active) ama uu dhammaaday.
        if (consultation.status === 'active' || consultation.status === 'follow-up' || consultation.isCompleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Lama kansali karo ballan hore u bilaabatay ama dhammaatay.' 
            });
        }

        // 1. Update Appointment Status
        await consultationsModel.findByIdAndUpdate(consultationId, { 
            cancelled: true,
            status: 'cancelled' 
        });

        // 2. Release Doctor's Slot
        const { doctorId, slotDate, slotTime } = consultation;
        const docData = await doctorModel.findById(doctorId);

        if (docData && docData.slots_booked && docData.slots_booked[slotDate]) {
            let slots_booked = docData.slots_booked;
            
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

            if (slots_booked[slotDate].length === 0) {
                delete slots_booked[slotDate];
            }

            await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });
        }

        res.json({ success: true, message: 'La-tashigii waa la kansalay, wakhtigiina waa la fasaxay' });

    } catch (error) {
        console.error("Ciladda Cancel-ka:", error);
        res.status(500).json({ success: false, message: "Cillad ayaa dhacday: " + error.message });
    }
};
export const patientJoinCall = async (req, res) => {
    try {
        const { consultationId } = req.body; 
        const now = new Date();

        const consultation = await consultationsModel.findById(consultationId);
        if (!consultation) {
            return res.json({ success: false, message: 'Ballanta lama helin' });
        }

        consultation.videoSession = consultation.videoSession || {};
        // Diiwaangeli waqtiga Bukaanka
        consultation.videoSession.patientJoinedAt = now;

        await consultation.save();
        res.json({ success: true, message: 'Bukaanku wuxuu soo galay call-ka' });

    } catch (error) {
        console.error("Cillad patientJoinCall:", error);
        res.json({ success: false, message: error.message });
    }
};


// 1. Forgot Password - User
export const forgotPasswordUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) return res.json({ success: false, message: "User leh iimaylkan lama helin!" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Daqiiqo

        await user.save();
        
        // 🚀 SHAQADAADII SEND-EMAIL-KA OO LA LAXAMIYEY
        await sendEmail({
            email: user.email,
            subject: "Gargaar Portal - Dib u habaynta Password-ka (OTP)",
            message: `Haye,\n\nWaxaad codsatay in aad beddesho password-kaaga Gargaar Portal.\n\nKoodhkaaga xaqiijinta (OTP) waa:\n\n ${otp} \n\nKoodhkani wuxuu dhacayaa 10 daqiiqo gudahood. Fadlan ha cidna la wadaagin.`
        });

        res.json({ success: true, message: "OTP ayaa email-kaaga loo diray!", email: user.email });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Verify OTP - User
export const verifyOTPUser = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await userModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            resetPasswordToken: hashedOTP,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.json({ success: false, message: "OTP waa khalad ama waqtigiisu wuu dhacay!" });

        res.json({ success: true, message: "OTP waa sax!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Reset Password - User
export const resetPasswordUser = async (req, res) => {
    try {
        const { token } = req.params; // Kani waa OTP-gii oo URL-ka soo raacay
        const { password } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.json({ success: false, message: "Waqtiga OTP-ga wuu dhacay, fadlan isku day mar kale!" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.json({ success: true, message: "Password-ka si guul leh ayaa loo bedelay!" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

///
export const addToCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body; 

        // Soo raadi user-ka
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User-ka lama helin" });
        }

        // 🛡️ XALKA CILADDA UNDEFINED: Hubi haddii cartData uu jiro, haddii kale ka dhig {}
        let cartData = userData.cartData ? { ...userData.cartData } : {};

        // Haddii dawadu horay ugu jirtay, 1 ku dar. Haddii kale, 1 ka dhig.
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }

        // Ku update garee Database-ka
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added to cart successfully!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserCart = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId || req.user?.id;

        if (!userId) {
            return res.json({ success: false, message: "User ID lama helin" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        // Hubi inuu soo celinayo cartData sax ah, haddii kale Object maran {}
        const cartData = userData.cartData || {}; 
        
        return res.json({ success: true, cartData });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};
// userController.js

export const updateCart = async (req, res) => {
    try {
        // 1. 🛡️ BULLETPROOF USERID CHECK: 
        // Kaga guuleyso middleware kasta, hadday xogta ku ridday body, req.userId, ama req.user
        const userId = req.body.userId || req.userId || req.user?.id;
        const { itemId, quantity } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "Cillad: User ID lama helin. Hubi Auth Middleware-kaaga!" });
        }

        // 2. Soo raadi User-ka
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User-ka lama helin database-ka" });
        }

        // 3. 💥 BREAK THE REFERENCE:
        // Samee koobi gabi ahaanba ka go'an kii hore si Mongoose ay u dareento isbeddelka
        let cartData = userData.cartData ? { ...userData.cartData } : {};

        // 4. Wax ka beddel xogta
        if (quantity <= 0) {
            delete cartData[itemId]; // Ka tirtir haddii eber la dhigo ama la gujiyo Trash
        } else {
            cartData[itemId] = quantity; // Ku dar ama kordhi
        }

        // 5. 🚀 NUCLEAR OPTION (Toos u update garee):
        // Halkii aan ordi lahayn userData.save(), waxaan isticmaalaynaa habkan tooska ah 
        // oo gabi ahaanba ku daxalsiinaya Object-ga cusub meeshii kii hore.
        await userModel.findByIdAndUpdate(
            userId, 
            { $set: { cartData: cartData } },
            { new: true }
        );

        return res.json({ success: true, message: "Cart-ga waa la cusboonaysiiyay!" });

    } catch (error) {
        console.log("Cart Error:", error);
        return res.json({ success: false, message: error.message });
    }
};
// ==========================================
// 💳 2. STRIPE CHECKOUT & VERIFICATION
// ==========================================

export const placeOrderStripe = async (req, res) => {
  try {
    // 1. 🛡️ KALIYA soo qaado xogta "aan la isku hallayn karin" (IDs iyo Address)
    // Waligaa ha ka soo qaadin req.body lacagta (totalAmount, commission, etc.)
    const { pharmacyId, items, address } = req.body;
    const userId = req.body.userId || req.user?.id; 

    const pharmacy = await pharmacyModel.findById(pharmacyId);
    if (!pharmacy) return res.json({ success: false, message: "Farmashiyaha lama helin" });

    // 2. 🧮 XISAABINTA RASMIGA AH EE BACKEND-KA (The Source of Truth)
    let calculatedTotalAmount = 0;
    const secureItems = [];

    // Loop garee items-ka uu soo diray macmiilku si aad DB uga soo saarto qiimahooda dhabta ah
    for (const item of items) {
      // 🚀 SAXID 1: Waxaan ka dhignay item.medicineId maadaama Frontend-ku sidaas u soo dirayo
      const product = await productModel.findById(item.medicineId);
      
      // 🚀 SAXID 2: Waxaan ka dhignay !product (Halkii ay markii hore ka ahayd !medicine)
      if (!product) {
        return res.status(400).json({ success: false, message: `Daawadan lama helin (ID: ${item.medicineId})` });
      }

      // Xisaabi qiimaha rasmiga ah: Qiimaha DB * Tirada uu dalbaday
      const itemTotal = product.price * item.quantity;
      calculatedTotalAmount += itemTotal;

      // Kaydi xogta daawada ee aad Stripe iyo Order-ka u dirayso
      secureItems.push({
        medicineId: product._id,
        name: product.name,
        price: product.price, // 🔒 Qiimaha rasmiga ah ee Database-ka
        quantity: item.quantity
      });
    }

    // 3. XISAABINTA KOMISHANKA IYO SAAMIGA FARMASHIYAGA
    const PLATFORM_COMMISSION_FEE = 0; // $2-ka Guddida Gargaar

    // Xaqiiji in aanay lacagtu eber ahayn ama aanay ka yarayn $2 si aanad khasaare u gelin
    if (calculatedTotalAmount < PLATFORM_COMMISSION_FEE) {
      return res.status(400).json({ success: false, message: "Qiimaha dalabku aad ayuu u yar yahay." });
    }

    const calculatedPayoutAmount = calculatedTotalAmount - PLATFORM_COMMISSION_FEE;

    // 🚀 4. DRAFT ORDER OO AMMAAN AH
    const draftOrderData = {
      userId,
      pharmacyId,
      items: secureItems, // 🔒 Waxaan isticmaalaynaa items-kii aan soo xaqiijinay
      totalAmount: calculatedTotalAmount, // 🔒 Xisaabtii aan soo samaynay
      platformCommission: PLATFORM_COMMISSION_FEE,
      pharmacyPayoutAmount: calculatedPayoutAmount,
      address,
      pharmacyPayoutMethod: pharmacy.payoutMethod || 'Bank',
      pharmacyPayoutAccount: pharmacy.payoutAccountNumber || 'N/A'
    };

    // 🔐 U bedel xogta dalabka Token sir ah (Valid for 1 hour)
    const orderToken = jwt.sign(draftOrderData, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 💳 TOOS STRIPE AYAAN U AADAYNAA
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Dalabka Daawada - ${pharmacy.name}` },
          // Stripe wuxuu u baahan yahay sentis, markaa $18 wuxuu noqonayaa 1800
          unit_amount: Math.round(calculatedTotalAmount * 100), 
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/verify-order?success=true&session_id={CHECKOUT_SESSION_ID}&order_token=${orderToken}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart?canceled=true`,
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error("Cilad Stripe Checkout:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOrderStripe = async (req, res) => {
  try {
    const { session_id, success, order_token } = req.body;

    if (success === "false") {
      return res.json({ success: false, message: "Lacag bixinta waa la joojiyay." });
    }

    if (success === "true") {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid') {
        
        // 🛡️ Idempotency check
        const existingOrder = await orderModel.findOne({ stripeSessionId: session_id });
        if (existingOrder) {
            return res.json({ success: true, message: "Dalabkan horay ayaa loo xaqiijiyay." });
        }

        // 🔓 Fur Token-ka si aan u helno xogtii dalabka
        let decodedOrderData;
        try {
            decodedOrderData = jwt.verify(order_token, process.env.JWT_SECRET);
        } catch (err) {
            return res.json({ success: false, message: "Token-ku wuu dhacay ama waa qaldan yahay." });
        }

        const user = await userModel.findById(decodedOrderData.userId).select("-password");

        // Samee verification PIN-ka
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newOrder = new orderModel({
          ...decodedOrderData,
          userPaymentMethod: 'Stripe',
          stripeSessionId: session.id,
          paymentStatus: 'PaidToPlatform', 
          payoutStatus: 'Holding',
          orderStatus: 'Processing',
          verificationCode,
          isVerified: false,
          date: Date.now()
        });

        await newOrder.save();

        // 🧼 3. NADIIFI DAMBIISHA (CLEAR CART) MAADAAMA LACAGTA LA BIXIYAY
        await userModel.findByIdAndUpdate(decodedOrderData.userId, { cartData: {} });

        // 📧 DIRISTA EMAIL-KA XAQIIJINTA IYO PIN-KA
        try {
          const transporter = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
              user: process.env.EMAIL_USER, 
              pass: process.env.EMAIL_PASS  
            },
            tls: { rejectUnauthorized: false }
          });

          const mailOptions = {
            from: `"Gargaar Pharmacy" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '🔒 Code-ka Xaqiijinta Dalabkaaga - Gargaar',
            html: `
              <div style="font-family: -apple-system, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                  <h2 style="color: #0f172a; text-align: center; font-size: 22px; font-weight: 700; margin-bottom: 8px;">
                    Dalabkaadii Waa La Xaqiijiyay! ✅
                  </h2>
                  <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px;">
                    Lacagtaadii waa la guddoomay, daawadiina waa laguu diyaarinayaa.
                  </p>
                  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; border-radius: 14px; text-align: center; border: 2px dashed #cbd5e1; margin-bottom: 28px;">
                    <span style="font-size: 14px; color: #2563eb; display: block; margin-bottom: 10px; font-weight: 700; text-transform: uppercase;">
                      Code-ka Bixinta Daawada (Verification Code)
                    </span>
                    <p style="font-size: 12px; color: #ef4444; margin-bottom: 15px;">
                      ⚠️ Koodhkan ha cidna la wadaagin illaa aad daawada gacanta ku dhigto! Sii farmashiyaha ama qofka kuu keenaya (Delivery) si uu dalabka u xiro.
                    </p>
                    <strong style="font-size: 36px; color: #1e1b4b; letter-spacing: 8px; font-family: monospace; background: #ffffff; padding: 8px 20px; border: 1px solid #e2e8f0; border-radius: 8px; display: inline-block;">
                      ${verificationCode}
                    </strong>
                  </div>
                </div>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error("Cilad email dirista:", emailError.message);
        }

        return res.json({ 
            success: true, 
            message: "Lacagta si guul leh ayaa loo bixiyay! Cart-gii waa la nadiifiyay, PIN-kiina email ayaa loo diray." 
        });

      } else {
        return res.json({ success: false, message: "Lacag bixinta weli ma dhameystirmin." });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID lama helin!" });
        }

        // 🚀 KAN WAA KOODHKA SAXDA AH:
        // 1. 'image' ayaan ka soo qaadnay farmashiyaha (halkii ay logo ahaan lahayd)
        // 2. '.populate' labaad ayaan u samaynay items.medicineId si sawirka daawada loogu soo daro xogta
        const orders = await orderModel.find({ userId })
            .populate('pharmacyId', 'name image') 
            .populate('items.medicineId', 'image') 
            .sort({ createdAt: -1 }); // Wuxuu u soo habaynayaa kuwa ugu cusub

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Cilad ayaa ka dhacday userOrders API:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};



export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment,};