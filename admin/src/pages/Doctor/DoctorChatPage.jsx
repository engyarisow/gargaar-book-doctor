import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import {
    Send, ChevronLeft, ShieldCheck, Mic, CheckCheck,
    Square, Paperclip, Play, Pause, Trash2, X, MoreVertical, Ban, UserX, FileText, Plus, Pill, Printer, Edit
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const DoctorChatPage = () => {
    const { consultationId } = useParams();
    const navigate = useNavigate();

    const { dToken, docInfo, profileData } = useContext(DoctorContext);
    const { userData } = useContext(AppContext);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [patientStatus, setPatientStatus] = useState({ isOnline: false, lastSeen: null });

    // Prescription States
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', frequency: '' }]);
    const [prescriptionNotes, setPrescriptionNotes] = useState('');
    const [isSendingPrescription, setIsSendingPrescription] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null); // STATE CUSUB OO LAGU XUKUMAYO EDIT-KA
    
    // View/Print Prescription Modal State
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    // Voice & Upload States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
    const [previewBlob, setPreviewBlob] = useState(null);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isSendingAudio, setIsSendingAudio] = useState(false);
    const [isSendingText, setIsSendingText] = useState(false);
    const [activeImageUrl, setActiveImageUrl] = useState(null);
    const [playingAudioId, setPlayingAudioId] = useState(null);

    const socketRef = useRef(null);
    const scrollRef = useRef();
    const menuRef = useRef();
    const fileInputRef = useRef();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const previewAudioRef = useRef(null);
    const activeAudioElementRef = useRef(null);
    const printRef = useRef(null);

    const currentDoctorId = docInfo?._id || profileData?._id;
    const currentDoctorName = docInfo?.name || profileData?.name || "Dr. Specialist";
    const currentDoctorSpeciality = docInfo?.speciality || profileData?.speciality || "General Practitioner";

    // Menu Click Outside Closer
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Chat History
    useEffect(() => {
        const fetchChatData = async () => {
            if (!dToken || !consultationId) return;
            try {
                const { data } = await axios.get(`${BACKEND_URL}/api/chat/history/${consultationId}?readerType=doctor`, {
                    headers: { Authorization: `Bearer ${dToken}`, token: dToken }
                });
                if (data.success) {
                    setMessages(data.messages || []);
                    setParticipants(data.participants);

                    if (data.participants?.patient) {
                        setPatientStatus({
                            isOnline: data.participants.patient.isOnline || false,
                            lastSeen: data.participants.patient.lastSeen || null
                        });
                    }

                    if (socketRef.current) {
                        socketRef.current.emit("mark_all_as_read", { consultationId, readerType: 'doctor' });
                    }
                }
            } catch (e) { console.error("Error history:", e); }
        };
        fetchChatData();
    }, [consultationId, dToken]);

    // Socket Connections
    useEffect(() => {
        if (!consultationId) return;
        socketRef.current = io(BACKEND_URL, { transports: ['polling', 'websocket'] });

        socketRef.current.emit("join_chat", { consultationId, userType: 'doctor', userId: currentDoctorId });
        socketRef.current.emit("mark_all_as_read", { consultationId, readerType: 'doctor' });

        socketRef.current.on("receive_message", (data) => {
            if (!data || !data.senderType) return;
            setMessages(prev => {
                if (prev.some(m => m?._id === data._id)) return prev;
                return [...prev, data];
            });
            if (data.senderType !== 'doctor') {
                socketRef.current.emit("mark_as_read", { consultationId, messageId: data._id });
            }
        });

        // Halkan waxaan ku qabanaynaa haddii fariin la edit garaystay si toos ah chat-ka uga bedelanto
        socketRef.current.on("message_updated", (updatedMsg) => {
            setMessages(prev => prev.map(msg => msg._id === updatedMsg._id ? updatedMsg : msg));
        });

        socketRef.current.on("messages_read_update", (updatedData) => {
            setMessages(prev => prev.map(msg => {
                if (updatedData?.messageId && msg._id === updatedData.messageId) return { ...msg, seen: true };
                if (!updatedData?.messageId && msg?.senderType === 'doctor') return { ...msg, seen: true };
                return msg;
            }));
        });

        socketRef.current.on("typing_status", (status) => {
            if (status?.senderType === 'patient') setIsTyping(status.typing);
        });

        socketRef.current.on("user_status_update", (statusData) => {
            if (statusData?.userType === 'patient') {
                setPatientStatus({ isOnline: statusData.isOnline, lastSeen: statusData.lastSeen || new Date() });
            }
        });

        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, [consultationId, currentDoctorId]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const formatLastSeen = (dateString) => {
        if (!dateString) return "Offline";
        const date = new Date(dateString);
        return `Last seen ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Form Reset Logic
    const resetPrescriptionForm = () => {
        setShowPrescriptionModal(false);
        setMedicines([{ name: '', dosage: '', duration: '', frequency: '' }]);
        setPrescriptionNotes('');
        setEditingMessageId(null);
    };

    // Edit Prescription Trigger
    const handleEditPrescription = (msg) => {
        const pData = msg.prescriptionData;
        if (!pData) return;
        setMedicines(pData.medicines && pData.medicines.length > 0 ? pData.medicines : [{ name: '', dosage: '', duration: '', frequency: '' }]);
        setPrescriptionNotes(pData.notes || '');
        setEditingMessageId(msg._id);
        setShowPrescriptionModal(true);
    };

    // Prescription Handlers
    const handleAddMedicineRow = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', frequency: '' }]);
    };

    const handleMedicineChange = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleRemoveMedicineRow = (index) => {
        if (medicines.length === 1) return;
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const handleSendPrescription = async (e) => {
        e.preventDefault();
        const finalId = currentDoctorId || participants?.doctor?._id;
        if (!dToken || !finalId || isSendingPrescription) return;

        const validMedicines = medicines.filter(m => m.name.trim() !== '');
        if (validMedicines.length === 0) {
            alert("Fadlan qor ugu yaraan hal daawo!");
            return;
        }

        setIsSendingPrescription(true);
        try {
            const payload = {
                consultationId,
                senderId: finalId,
                senderType: 'doctor',
                text: `📋 Medical Prescription`,
                fileType: 'prescription',
                prescriptionData: {
                    doctorName: currentDoctorName,
                    doctorSpeciality: currentDoctorSpeciality,
                    patientName: participants?.patient?.name || 'Patient',
                    medicines: validMedicines,
                    notes: prescriptionNotes,
                    date: new Date().toISOString()
                }
            };

            // Haddii la edit garaynayo
            if (editingMessageId) {
                // FIIRO GAAR AH: Waa inaad samaysaa Backend Route u dhigma kan (/api/chat/edit-message/:id)
                const { data } = await axios.put(`${BACKEND_URL}/api/chat/edit-message/${editingMessageId}`, payload, {
                    headers: { Authorization: `Bearer ${dToken}`, token: dToken }
                });

                if (data.success) {
                    if (socketRef.current) socketRef.current.emit("update_message", data.data);
                    setMessages(prev => prev.map(m => m._id === editingMessageId ? data.data : m));
                    resetPrescriptionForm();
                }
            } else {
                // Fariin cusub baa la dirayaa
                const { data } = await axios.post(`${BACKEND_URL}/api/chat/send`, payload, {
                    headers: { Authorization: `Bearer ${dToken}`, token: dToken }
                });

                if (data.success) {
                    if (socketRef.current) socketRef.current.emit("send_message", { consultationId, ...data.data });
                    setMessages(prev => [...prev, data.data]);
                    resetPrescriptionForm();
                }
            }
        } catch (error) {
            console.error("Error sending/editing prescription:", error);
            alert("Cilad baa dhacday. Fadlan iska hubi xiriirka intarnet-ka ama Backend-ka.");
        } finally {
            setIsSendingPrescription(false);
        }
    };

    const handlePrintPrescription = () => {
        window.print();
    };

    // Voice & Standard File Upload Methods
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let options = { mimeType: 'audio/webm;codecs=opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: '' };

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setPreviewBlob(blob);
                setAudioPreviewUrl(URL.createObjectURL(blob));
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
        } catch (err) { console.error("Mic error:", err); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const discardVoiceNote = () => {
        setAudioPreviewUrl(null); setPreviewBlob(null); setIsPreviewPlaying(false); setRecordingTime(0); setIsSendingAudio(false);
    };

    const togglePreviewPlay = () => {
        if (!previewAudioRef.current) return;
        if (isPreviewPlaying) { previewAudioRef.current.pause(); setIsPreviewPlaying(false); }
        else { previewAudioRef.current.play(); setIsPreviewPlaying(true); }
    };

    const playSentAudio = (msgId, url) => {
        if (playingAudioId === msgId) {
            if (activeAudioElementRef.current) activeAudioElementRef.current.pause();
            setPlayingAudioId(null);
        } else {
            if (activeAudioElementRef.current) activeAudioElementRef.current.pause();
            const audio = new Audio(url); activeAudioElementRef.current = audio;
            setPlayingAudioId(msgId); audio.play();
            audio.onended = () => setPlayingAudioId(null);
        }
    };

    const uploadFileToBackend = async (file, fileType) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("consultationId", consultationId);
        formData.append("senderId", currentDoctorId || participants?.doctor?._id);
        formData.append("senderType", "doctor");
        formData.append("fileType", fileType);

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/chat/upload`, formData, {
                headers: { Authorization: `Bearer ${dToken}`, token: dToken, 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                if (socketRef.current) socketRef.current.emit("send_message", { consultationId, ...data.data });
                setMessages(prev => [...prev, data.data]);
                discardVoiceNote();
            }
        } catch (error) { console.error("Upload Error:", error); }
        finally { setUploading(false); setIsSendingAudio(false); }
    };

    const sendVoiceNote = () => {
        if (!previewBlob || isSendingAudio) return;
        setIsSendingAudio(true);
        const audioFile = new File([previewBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        uploadFileToBackend(audioFile, 'audio');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
        uploadFileToBackend(file, type);
    };

    const handleSendText = async (e) => {
        if (e) e.preventDefault();
        const finalId = currentDoctorId || participants?.doctor?._id;
        if (!message.trim() || !dToken || !finalId || isSendingText) return;

        setIsSendingText(true);
        const cleanText = message.trim();
        setMessage("");

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/chat/send`,
                { consultationId, senderId: finalId, senderType: 'doctor', text: cleanText },
                { headers: { Authorization: `Bearer ${dToken}`, token: dToken } }
            );
            if (data.success) {
                if (socketRef.current) socketRef.current.emit("send_message", { consultationId, ...data.data });
                setMessages(prev => [...prev, data.data]);
            }
        } catch (e) { console.error("Text Send Error:", e); }
        finally { setIsSendingText(false); }
    };

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

    const getInitials = (name) => name ? name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DOC';

    const DynamicAvatar = ({ user, isMe }) => (
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${isMe ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
            {user?.image ? <img src={user.image} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <span className="text-white font-bold text-xs">{getInitials(user?.name)}</span>}
        </div>
    );

    return (
        <div className="fixed inset-0 w-screen h-screen flex bg-[#efeae2] z-[9999] p-0 m-0 overflow-hidden">
            <div className="w-full h-full flex flex-col overflow-hidden relative">

                {/* Chat Header */}
                <header className="h-16 border-b flex items-center justify-between px-4 shrink-0 bg-[#f0f2f5] z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-200 rounded-full text-slate-700"><ChevronLeft size={24} /></button>
                        <DynamicAvatar user={participants?.patient} isMe={false} />
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm md:text-base">{participants?.patient?.name || 'Patient'}</h2>
                            <p className={`text-xs font-medium ${patientStatus.isOnline || isTyping ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {isTyping ? "Wuu qorayaa..." : patientStatus.isOnline ? "Online" : formatLastSeen(patientStatus.lastSeen)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 relative" ref={menuRef}>
                        <button onClick={() => setShowMenu(!showMenu)} className={`p-1.5 rounded-full transition-colors ${showMenu ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-200/60'}`}><MoreVertical size={20} /></button>
                        {showMenu && (
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1 z-50">
                                <button type="button" className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><UserX size={15} className="text-gray-400" /> Patient History</button>
                                <button type="button" onClick={() => { setShowMenu(false); setShowPrescriptionModal(true); }} className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><FileText size={15} className="text-emerald-600" /> Write Prescription</button>
                                <hr className="my-1 border-gray-100" />
                                <button type="button" className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"><Ban size={15} /> Close Session</button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Chat Messages Body */}
                <main className="flex-1 overflow-y-auto px-4 py-4 md:px-12 flex flex-col gap-3">
                    <div className="mx-auto bg-white/80 border text-slate-600 text-[11px] px-3 py-1 rounded-md shadow-sm flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-600" /> End-to-End Encrypted</div>

                    {messages.filter(m => m?.senderType).map((msg, idx) => {
                        const isMe = msg.senderType === 'doctor';
                        const sender = isMe ? participants?.doctor : participants?.patient;
                        const isMessageRead = msg.seen === true;
                        const pData = msg.prescriptionData;

                        return (
                            <div key={idx} className={`flex w-full gap-2 my-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && <DynamicAvatar user={sender} isMe={isMe} />}
                                
                                <div className={`relative max-w-[90%] md:max-w-[450px] shadow-sm rounded-lg text-sm ${
                                    msg.fileType === 'prescription' 
                                    ? 'bg-transparent shadow-none p-0 w-full' 
                                    : (isMe ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none px-3 py-2' : 'bg-white text-slate-800 rounded-tl-none px-3 py-2')
                                }`}>
                                    
                                    {msg.fileType === 'prescription' ? (
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 shadow-md text-slate-800 w-full flex flex-col gap-3 font-sans relative">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-xl shadow-sm border border-emerald-200">Rx</div>
                                                    <div>
                                                        <h3 className="font-bold text-sm text-slate-900">{pData?.doctorName || currentDoctorName}</h3>
                                                        <p className="text-[11px] text-slate-500 font-medium">{pData?.doctorSpeciality || currentDoctorSpeciality}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase tracking-wider">Warqad Daawo</span>
                                                </div>
                                            </div>

                                            <div className="border-t border-dashed border-gray-300"></div>

                                            {/* Patient Info */}
                                            <div className="flex justify-between items-center text-xs">
                                                <div>
                                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Bukaanka / Patient</p>
                                                    <p className="font-bold text-slate-800">{pData?.patientName || participants?.patient?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Taariikhda / Date</p>
                                                    <p className="font-bold text-slate-800">{new Date(pData?.date || msg.time).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="border-t border-dashed border-gray-300"></div>

                                            {/* Medicines List */}
                                            <div>
                                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Liiska Dawooyinka (Medicines)</p>
                                                <div className="space-y-2">
                                                    {pData?.medicines?.map((med, mIdx) => (
                                                        <div key={mIdx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs">
                                                            <p className="font-bold text-slate-900 text-sm mb-1">{mIdx + 1}. {med.name}</p>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 text-[11px] font-medium">
                                                                {med.dosage && <span><strong className="text-slate-400">Qiyaasta:</strong> {med.dosage}</span>}
                                                                {med.frequency && <span><strong className="text-slate-400">Isticmaalka:</strong> {med.frequency}</span>}
                                                                {med.duration && <span><strong className="text-slate-400">Muddada:</strong> {med.duration}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {pData?.notes && (
                                                <div className="bg-blue-50/50 p-3 rounded-lg text-xs text-blue-900 border border-blue-100 mt-1">
                                                    <p className="text-blue-500 text-[10px] uppercase font-bold tracking-wider mb-1">Talada Dhakhtarka</p>
                                                    <p className="leading-relaxed font-medium">{pData.notes}</p>
                                                </div>
                                            )}

                                            <div className="border-t border-dashed border-gray-300 mt-1"></div>

                                            {/* Action Buttons (Arag vs Edit) */}
                                            <div className="flex gap-2 mt-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedPrescription(pData)}
                                                    className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                                                >
                                                    <Printer size={16} /> Arag / Print
                                                </button>
                                                
                                                {/* Edit Button - Dhakhtarka uun baa arkaya */}
                                                {isMe && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleEditPrescription(msg)}
                                                        className="flex-1 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                                                    >
                                                        <Edit size={16} /> Wax ka badal
                                                    </button>
                                                )}
                                            </div>

                                            <div className="absolute -bottom-5 right-1 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                {isMe && <CheckCheck size={14} className={isMessageRead ? 'text-[#53bdeb]' : 'text-slate-400'} />}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {(msg.content?.fileType === 'text' || msg.text) && (
                                                <p className="whitespace-pre-wrap break-words pr-12 text-[14px] leading-relaxed">{msg.content?.text || msg.text}</p>
                                            )}
                                            {msg.content?.fileType === 'image' && <img src={msg.content.fileUrl} className="rounded-md max-w-full max-h-72 object-cover border border-slate-100 cursor-pointer" onClick={() => setActiveImageUrl(msg.content.fileUrl)} alt="Attachment" />}
                                            {msg.content?.fileType === 'video' && <video src={msg.content.fileUrl} controls className="rounded-md max-w-full max-h-72" />}
                                            {msg.content?.fileType === 'audio' && (
                                                <div className="flex items-center gap-3 py-2 px-3 w-[260px] sm:w-[290px]">
                                                    <button type="button" onClick={() => playSentAudio(msg._id, msg.content.fileUrl)} className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">{playingAudioId === msg._id ? <Pause size={16} className="fill-current text-emerald-600" /> : <Play size={16} className="fill-current text-slate-600 ml-0.5" />}</button>
                                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                                        <div className="flex items-center gap-0.5 h-4 mb-0.5">
                                                            {[3, 5, 2, 6, 7, 4, 3, 5, 7, 4, 6, 3, 5, 2, 6, 4].map((h, i) => <div key={i} className={`flex-1 rounded-sm ${playingAudioId === msg._id ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} style={{ height: `${h * 2}px` }} />)}
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 truncate font-medium">Fariin Cod ah</span>
                                                    </div>
                                                    <Mic size={16} className="text-emerald-500 shrink-0 self-end mb-1" />
                                                </div>
                                            )}

                                            <div className="flex justify-end items-center gap-0.5 text-[9px] text-slate-400 font-medium mt-1 pr-1 pb-0.5">
                                                <span>{msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                {isMe && <CheckCheck size={13} className={isMessageRead ? 'text-[#53bdeb]' : 'text-slate-400'} />}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {isMe && <DynamicAvatar user={sender} isMe={isMe} />}
                            </div>
                        );
                    })}
                    {uploading && <div className="text-center text-xs text-slate-500 animate-pulse">Faylka baa la dirayaa...</div>}
                    <div ref={scrollRef} />
                </main>

                {/* Chat Footer Input Controls */}
                <footer className="p-2 md:p-3 bg-[#f0f2f5] border-t flex items-center gap-2 shrink-0 z-10">
                    {!isRecording && !audioPreviewUrl && (
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 bg-white rounded-lg px-2 py-1 flex items-center border border-slate-200">
                                <button type="button" onClick={() => fileInputRef.current.click()} disabled={isSendingText} className="p-2 text-slate-500 hover:text-slate-700"><Paperclip size={20} /></button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                                <input
                                    value={message} disabled={isSendingText}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        if (socketRef.current) socketRef.current.emit("typing", { consultationId, senderType: 'doctor', typing: e.target.value.length > 0 });
                                    }}
                                    placeholder="Fariintaada qor..." className="w-full bg-transparent py-2 px-2 text-sm outline-none text-slate-800"
                                />
                            </div>
                            {message.trim() ? (
                                <button onClick={handleSendText} disabled={isSendingText} className="h-11 w-11 flex items-center justify-center bg-emerald-600 text-white rounded-full shadow-md shrink-0"><Send size={18} className="ml-0.5" /></button>
                            ) : (
                                <button type="button" onClick={startRecording} disabled={isSendingText} className="h-11 w-11 flex items-center justify-center bg-slate-600 text-white rounded-full shadow-md shrink-0"><Mic size={20} /></button>
                            )}
                        </div>
                    )}

                    {isRecording && (
                        <div className="flex items-center justify-between w-full bg-white rounded-lg px-4 py-2 border border-red-200">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                                <span className="text-sm font-semibold text-red-600 tracking-wide">{formatTime(recordingTime)}</span>
                                <span className="text-xs text-slate-400">Codka baa la duubayaa...</span>
                            </div>
                            <button type="button" onClick={stopRecording} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full"><Square size={16} className="fill-current" /></button>
                        </div>
                    )}

                    {audioPreviewUrl && (
                        <div className="flex items-center gap-3 w-full bg-white rounded-lg px-3 py-2 border border-emerald-200">
                            <button type="button" onClick={discardVoiceNote} disabled={isSendingAudio} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border">
                                <button type="button" onClick={togglePreviewPlay} disabled={isSendingAudio} className="text-emerald-600">{isPreviewPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current text-slate-600 ml-0.5" />}</button>
                                <span className="text-xs text-slate-500 font-medium">Dhagayso kahor intaanad dirin</span>
                                <audio ref={previewAudioRef} src={audioPreviewUrl} onEnded={() => setIsPreviewPlaying(false)} className="hidden" />
                            </div>
                            <button type="button" onClick={sendVoiceNote} disabled={isSendingAudio} className="h-10 w-10 flex items-center justify-center bg-emerald-600 text-white rounded-full shadow-md shrink-0"><Send size={16} className="ml-0.5" /></button>
                        </div>
                    )}
                </footer>

                {/* --- WRITE / EDIT PRESCRIPTION FORM MODAL --- */}
                {showPrescriptionModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
                        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className={`px-6 py-4 ${editingMessageId ? 'bg-blue-600' : 'bg-emerald-600'} text-white flex items-center justify-between transition-colors`}>
                                <div className="flex items-center gap-2">
                                    <Pill size={22} />
                                    <h3 className="font-bold text-lg">
                                        {editingMessageId ? 'Dib u habaynta Dawooyinka (Edit)' : 'Qorista Dawooyinka (Prescription)'}
                                    </h3>
                                </div>
                                <button onClick={resetPrescriptionForm} className="p-1.5 hover:bg-white/20 rounded-full"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSendPrescription} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Liiska Dawooyinka</label>
                                    {medicines.map((med, index) => (
                                        <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3 relative">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold ${editingMessageId ? 'text-blue-700' : 'text-emerald-700'}`}>Daawada #{index + 1}</span>
                                                {medicines.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveMedicineRow(index)} className="text-rose-500 hover:text-rose-700 p-1"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Magaca Dawada (tusaale: Amoxicillin)"
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Qiyaasta (tusaale: 500mg)"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Isticmaalka (tusaale: 3 jeer maalintii)"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Muddada (tusaale: 5 cisho)"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddMedicineRow} className={`self-start flex items-center gap-1.5 text-xs font-bold ${editingMessageId ? 'text-blue-600 hover:text-blue-700 bg-blue-50 border-blue-200' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 border-emerald-200'} py-1 px-2 rounded-lg border`}><Plus size={15} /> Ku dar daawo kale</button>
                                </div>

                                <div className="flex flex-col gap-1.5 mt-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tusmada ama Talada Dhakhtarka</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Fariin ama tilmaamo dheeraad ah..."
                                        value={prescriptionNotes}
                                        onChange={(e) => setPrescriptionNotes(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t mt-2">
                                    <button type="button" onClick={resetPrescriptionForm} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">Jooji</button>
                                    <button type="submit" disabled={isSendingPrescription} className={`px-6 py-2 rounded-xl text-sm font-semibold text-white shadow-md disabled:opacity-50 ${editingMessageId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                        {isSendingPrescription ? "Waa la dirayaa..." : (editingMessageId ? "Gudbi Isbadalka" : "U Dir Bukaanka")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- PRINT / PDF RECEIPT MODAL --- */}
                {selectedPrescription && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[20000] p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto relative">
                            {/* Action Buttons Top Bar */}
                            <div className="px-6 py-3 bg-slate-100 border-b flex items-center justify-between print:hidden">
                                <span className="font-bold text-xs text-slate-700">Medical Prescription Receipt</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handlePrintPrescription} 
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Printer size={15} /> Print / PDF
                                    </button>
                                    <button onClick={() => setSelectedPrescription(null)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600"><X size={20} /></button>
                                </div>
                            </div>

                            {/* Printable Receipt Paper Container */}
                            <div className="p-8 sm:p-12 bg-white text-slate-800 flex flex-col gap-6" ref={printRef}>
                                {/* Header Details */}
                                <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-6">
                                    <div>
                                        <h1 className="text-xl font-black text-emerald-700 tracking-tight">{selectedPrescription.doctorName}</h1>
                                        <p className="text-xs font-semibold text-slate-500">{selectedPrescription.doctorSpeciality}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Gargaar Healthcare Portal</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-300 tracking-widest block">Rx</span>
                                        <p className="text-xs font-medium text-slate-600">Taariikhda: {new Date(selectedPrescription.date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Patient Info Box */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Magaca Bukaanka</span>
                                        <span className="text-sm font-bold text-slate-800">{selectedPrescription.patientName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Nooca Adeega</span>
                                        <span className="text-sm font-bold text-emerald-600">Online Consultation</span>
                                    </div>
                                </div>

                                {/* Medicines Table */}
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Dawooyinka La Qoray (Prescribed Medications)</h3>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                                    <th className="p-3 font-bold">#</th>
                                                    <th className="p-3 font-bold">Magaca Dawada</th>
                                                    <th className="p-3 font-bold">Qiyaasta</th>
                                                    <th className="p-3 font-bold">Isticmaalka</th>
                                                    <th className="p-3 font-bold">Muddada</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPrescription.medicines?.map((med, mIdx) => (
                                                    <tr key={mIdx} className="border-b border-slate-100 last:border-none">
                                                        <td className="p-3 font-semibold text-slate-500">{mIdx + 1}</td>
                                                        <td className="p-3 font-bold text-slate-900">{med.name}</td>
                                                        <td className="p-3 text-slate-700">{med.dosage || '-'}</td>
                                                        <td className="p-3 text-slate-700">{med.frequency || '-'}</td>
                                                        <td className="p-3 text-slate-700">{med.duration || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedPrescription.notes && (
                                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col gap-1">
                                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Tilmaamaha Dhakhtarka (Doctor Notes):</span>
                                        <p className="text-xs text-slate-700 leading-relaxed">{selectedPrescription.notes}</p>
                                    </div>
                                )}

                                {/* Footer Signature */}
                                <div className="flex justify-between items-end pt-12 mt-4 border-t border-slate-200">
                                    <div className="text-[10px] text-slate-400">
                                        <p>Warqaddani waa mid dijitaal ah oo laga soo saaray nidaamka caafimaadka.</p>
                                        <p>Idanka Dhakhtarka ayaa sax ah.</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-serif italic font-bold text-emerald-800 text-base mb-1">{selectedPrescription.doctorName}</div>
                                        <div className="w-36 border-b border-slate-400 mb-1"></div>
                                        <span className="text-[11px] font-bold text-slate-600">Saxexa / Saxiixa Dhakhtarka</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fullscreen Image Preview Modal */}
                {activeImageUrl && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4">
                        <button type="button" onClick={() => setActiveImageUrl(null)} className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full"><X size={26} /></button>
                        <img src={activeImageUrl} alt="Preview Fullscreen" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorChatPage;