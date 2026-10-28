import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/mongodb.js";
import cloudinary from "./config/cloudinary.js";


// Models (Waxaa loo baahan yahay si database-ka loogu casriyeeyo fariimaha la akhriyey)
import Message from "./models/MessageModel.js"; 

// Routes
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import postRoutes from "./routes/postRoute.js";
import hospitalRouter from './routes/hospitalRoute.js';
import pharmacyRouter from './routes/pharmacyRoute.js';
import chatRouter from "./routes/chatRoute.js"; 
import bodyParser from "body-parser";
import Stripe from "stripe";    
import { stripeWebhook } from "./controllers/stripeWebhook.js";
// Services
import startConsultationCron from './cron/consultationCron.js';

// ================= CONFIGURATION =================
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

connectDB();

// ================= MIDDLEWARE =================
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// ================= HTTP & SOCKET SETUP =================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
});

app.set("io", io);

// ================= ROUTES =================
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postRoutes);
app.use('/api/hospital', hospitalRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use("/api/chat", chatRouter); 

app.get("/", (req, res) => res.send("🚀 Gargaar Medical API Working"));

app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

// ================= SOCKET ONLINE & SEEN MANAGEMENT =================
// Map-kaan wuxuu kaydinayaa socket.id kasta iyo xogta qofka (consultationId, userType, userId)
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // 1. JOIN CHAT ROOM & ONLINE STATUS TRIGGER
  socket.on("join_chat", (data) => {
    // Haddii data ay tahay Object (Sida Frontend-ku u soo dirayo)
    if (data && typeof data === 'object') {
      const { consultationId, userType, userId } = data;
      
      socket.join(consultationId);
      
      // Ku kaydi isticmaalahaan liiska dadka hadda ku jira chat-ka
      activeUsers.set(socket.id, { consultationId, userType, userId });

      // U sheeg qofka kale ee qolka ku jira in qofkani uu hadda soo galay (Online)
      socket.to(consultationId).emit("user_status_update", {
        userType,
        userId,
        isOnline: true,
        lastSeen: null
      });

      console.log(`👤 ${userType} (${userId}) joined room: ${consultationId}`);
    } else if (data) {
      // Tani waa fallback haddii meel kale lagala soo xidhiidho iyadoo kaliya xadhig (string id) ah
      socket.join(data);
      console.log(`👤 Anonymous joined room: ${data}`);
    }
  });

  // 2. MARK ALL AS READ (Marka uu qofku hadda chat-ka soo galo)
  socket.on("mark_all_as_read", async ({ consultationId, readerType }) => {
    try {
      // Haddii uu akhriyey doctor, waxaan true ka dhigaynaa fariimihii patient-ka
      const senderToMark = readerType === 'doctor' ? 'patient' : 'doctor';

      // Database-ka ku dhufo update
      await Message.updateMany(
        { consultationId, senderType: senderToMark, seen: false },
        { $set: { seen: true } }
      );

      // U sheeg qofka kale ee qolka ku jira in fariimihii la wada akhriyey (Si Blue Ticks u soo baxaan)
      io.to(consultationId).emit("messages_read_update", { readerType });
      
    } catch (err) {
      console.error("❌ Error in mark_all_as_read:", err.message);
    }
  });

  // 3. MARK AS READ (Marka fariin cusub ay soo dhacdo labada qofna ay wada fadhiyaan chat-ka)
  socket.on("mark_as_read", async ({ consultationId, messageId }) => {
    try {
      // Hal fariin database-ka uga dhig seen: true
      await Message.findByIdAndUpdate(messageId, { $set: { seen: true } });

      // U sheeg qolka in fariintaas gaarka ah la akhriyey
      io.to(consultationId).emit("messages_read_update", { messageId });
    } catch (err) {
      console.error("❌ Error in mark_as_read:", err.message);
    }
  });

  // 4. SEND MESSAGE BROADCAST
  socket.on("send_message", (data) => {
    io.to(data.consultationId).emit("receive_message", data);
  });

  // 5. TYPING STATUS
  socket.on("typing", (data) => {
    socket.to(data.consultationId).emit("typing_status", data);
  });

  // 6. DISCONNECT & WHATSAPP-STYLE LAST SEEN TRIGGER
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
    
    // Soo hel xogta qofka hadda go'ay (disconnected) ee ku jirtay activeUsers Map
    const userData = activeUsers.get(socket.id);
    
    if (userData) {
      const { consultationId, userType, userId } = userData;
      const currentTimestamp = new Date();

      // U sheeg qofka kale ee qolka ku jira in qofkii uu ka baxay (Offline) iyo xilligii ugu dambeeyey (Last Seen)
      socket.to(consultationId).emit("user_status_update", {
        userType,
        userId,
        isOnline: false,
        lastSeen: currentTimestamp
      });

      // Ka tirtir liiska dadka hadda online-ka ah maadaama uu ka baxay chat-ka
      activeUsers.delete(socket.id);
    }
  });
});

// ================= START SERVER =================
server.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  startConsultationCron();
});