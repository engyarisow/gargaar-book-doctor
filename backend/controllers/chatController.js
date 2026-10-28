import Message from "../models/MessageModel.js";
import consultationsModel from "../models/consultationsModel.js";
import { v2 as cloudinary } from 'cloudinary';

/**
 * @route   GET /api/chat/history/:consultationId
 * @desc    Fetch history with Doctor and Patient details & update read status
 */
export const getChatHistory = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const { readerType } = req.query; // 'doctor' ama 'patient' ayaa laga soo baasayaa URL-ka query ahaan

        // 1. Haddii uu jiro readerType, marka hore fariimihii qofka kale ka dhig 'seen: true'
        if (readerType) {
            const senderToMark = readerType === 'doctor' ? 'patient' : 'doctor';
            await Message.updateMany(
                { consultationId, senderType: senderToMark, seen: false },
                { $set: { seen: true } }
            );
            
            // Sidoo kale u sheeg socket-ka in fariimihii hore la wada akhriyey (Haddii qofka kale online yahay)
            const io = req.app.get("io");
            if (io) {
                io.to(consultationId).emit("messages_read_update", { readerType });
            }
        }

        // 2. Fetch messages ordered by timeline
        const messages = await Message.find({ consultationId }).sort({ time: 1 }).lean();

        // 3. Fetch Consultation and Populate fields safely
        const consultation = await consultationsModel.findById(consultationId)
            .populate('doctorId', 'name image degree') 
            .populate('patientId', 'name image') 
            .lean();

        if (!consultation) {
            return res.status(404).json({ success: false, message: "Consultation not found" });
        }

        // 4. Return structured data safely to prevent blank pages on frontend
        res.status(200).json({ 
            success: true, 
            messages: messages || [],
            participants: {
                doctor: consultation.doctorId || { name: "Doctor", image: "" },
                patient: consultation.patientId || { name: "Patient", image: "" }
            }
        });

    } catch (error) {
        console.error("❌ Chat History Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to retrieve history" });
    }
};

/**
 * @route   POST /api/chat/send
 * @desc    Save standard text message (Supports inline file strings if necessary)
 */
export const saveMessage = async (req, res) => {
    try {
        const { consultationId, senderId, senderType, text } = req.body;

        // Validation Check (Must have text content)
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: "Cannot send an empty message" });
        }

        // Create document in MongoDB (Lagu daray seen: false)
        const newMessage = await Message.create({
            consultationId,
            senderId,
            senderType,
            content: {
                text: text.trim(),
                fileUrl: null,
                fileType: 'text',
                fileName: ""
            },
            seen: false, // Mar walba fariinta cusub waa mid aan la akhrin
            time: new Date()
        });

        // Trigger Real-time Event via Socket.io
        const io = req.app.get("io");
        if (io) {
            io.to(consultationId).emit("receive_message", newMessage);
        }

        res.status(201).json({ success: true, data: newMessage });

    } catch (error) {
        console.error("❌ Message Transmission Error:", error.message);
        res.status(500).json({ success: false, message: "Transmission failed on server" });
    }
};

/**
 * @route   POST /api/chat/upload
 * @desc    Upload file attachments (images, video, audio) to Cloudinary and broadcast
 */
export const uploadChatAttachment = async (req, res) => {
    try {
        const { consultationId, senderId, senderType, fileType } = req.body;

        // Ensure file middleware did its job
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No multimedia file provided" });
        }

        let detectedFileType = fileType || 'file';
        
        // Auto-detect & map MIME formats securely if client types look generic
        if (req.file.mimetype.startsWith('image/')) {
            detectedFileType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
            detectedFileType = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
            detectedFileType = 'audio';
        }

        // Upload directly to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto",
            folder: "gargaar_chat_attachments"
        });

        // Save generated data into MongoDB (Lagu daray seen: false)
        const newMessage = await Message.create({
            consultationId,
            senderId,
            senderType,
            content: {
                text: "",
                fileUrl: uploadResult.secure_url,
                fileType: detectedFileType,
                fileName: req.file.originalname
            },
            seen: false, // Mar walba fariinta cusub waa mid aan la akhrin
            time: new Date()
        });

        // Broadcast real-time message packet down live communication sockets
        const io = req.app.get("io");
        if (io) {
            io.to(consultationId).emit("receive_message", newMessage);
        }

        res.status(201).json({ success: true, data: newMessage });

    } catch (error) {
        console.error("❌ Multi-media Upload Error:", error.message);
        res.status(500).json({ success: false, message: "Attachment upload pipeline failed" });
    }
};

/**
 * @route   POST /api/chat/prescription
 * @desc    Save and broadcast medical prescription message
 */
export const sendPrescription = async (req, res) => {
    try {
        const { consultationId, senderId, senderType, prescriptionData, text } = req.body;

        if (!prescriptionData) {
            return res.status(400).json({ success: false, message: "Prescription data is missing" });
        }

        const newMessage = await Message.create({
            consultationId,
            senderId,
            senderType,
            content: {
                text: text || "Medical Prescription",
                fileUrl: null,
                fileType: 'prescription',
                fileName: "",
                prescriptionData: prescriptionData
            },
            seen: false,
            time: new Date()
        });

        const io = req.app.get("io");
        if (io) {
            io.to(consultationId).emit("receive_message", newMessage);
        }

        res.status(201).json({ success: true, data: newMessage });

    } catch (error) {
        console.error("❌ Prescription Transmission Error:", error.message);
        res.status(500).json({ success: false, message: "Prescription transmission failed on server" });
    }
};

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user conversations
 */
export const getConversations = async (req, res) => {
    try {
        const userId = req.senderId; 
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID missing from token." });
        }

        const consultations = await consultationsModel.find({
            $or: [{ doctorId: userId }, { patientId: userId }]
        }).populate('doctorId patientId', 'name image');

        const conversations = await Promise.all(consultations.map(async (c) => {
            const lastMessage = await Message.findOne({ consultationId: c._id })
                                               .sort({ time: -1 });
                                               
            const unreadCount = await Message.countDocuments({ 
                consultationId: c._id, 
                seen: false,
                senderId: { $ne: userId }
            });
            
            return { 
                _id: c._id, 
                participants: {
                    doctor: c.doctorId,
                    patient: c.patientId
                },
                lastMessage, 
                unreadCount 
            };
        }));

        res.json({ success: true, conversations });
    } catch (e) { 
        res.status(500).json({ success: false, message: e.message }); 
    }
};