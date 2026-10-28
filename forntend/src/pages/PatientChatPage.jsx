import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { 
    Send, ChevronLeft, ShieldCheck, Mic, CheckCheck, 
    Square, Paperclip, Play, Pause, Trash2, X
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const PatientChatPage = () => {
    const { consultationId } = useParams();
    const navigate = useNavigate();
    const { token, userData } = useContext(AppContext);
    
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    // Recording & Preview States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
    const [previewBlob, setPreviewBlob] = useState(null);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Production Lock States (Prevents any duplication)
    const [isSendingAudio, setIsSendingAudio] = useState(false);
    const [isSendingText, setIsSendingText] = useState(false);

    // In-App Image Popup State
    const [activeImageUrl, setActiveImageUrl] = useState(null);

    // Sent Voice Notes Playing State
    const [playingAudioId, setPlayingAudioId] = useState(null);
    
    const socketRef = useRef(null);
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const previewAudioRef = useRef(null);
    const activeAudioElementRef = useRef(null);

    const currentPatientId = userData?._id;

    // Fetch Chat History
    useEffect(() => {
        const fetchChatData = async () => {
            if (!token || !consultationId) return;
            try {
                const { data } = await axios.get(`${BACKEND_URL}/api/chat/history/${consultationId}`, {
                    headers: { Authorization: `Bearer ${token}`, token }
                });
                if (data.success) {
                    setMessages(data.messages || []);
                    setParticipants(data.participants);
                    if (socketRef.current) {
                        socketRef.current.emit("mark_all_as_read", { consultationId, readerType: 'patient' });
                    }
                }
            } catch (e) { console.error("Error history:", e); }
        };
        fetchChatData();
    }, [consultationId, token]);

    // Socket Connections
    useEffect(() => {
        if (!consultationId) return;
        socketRef.current = io(BACKEND_URL, { transports: ['polling', 'websocket'] });
        socketRef.current.emit("join_chat", consultationId);

        socketRef.current.on("receive_message", (data) => {
            if (!data || !data.senderType) return;
            
            // PRODUCTION FIX: Double check inside socket to never insert duplicate message _id
            setMessages(prev => {
                const exists = prev.some(m => m?._id === data._id);
                if (exists) return prev;
                return [...prev, data];
            });

            if (data.senderType !== 'patient') {
                socketRef.current.emit("mark_as_read", { consultationId, messageId: data._id });
            }
        });

        socketRef.current.on("messages_read_update", () => {
            setMessages(prev => prev.map(msg => msg?.senderType === 'patient' ? { ...msg, seen: true } : msg));
        });

        socketRef.current.on("typing_status", (status) => {
            if (status?.senderType === 'doctor') setIsTyping(status.typing);
        });

        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, [consultationId]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
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
        } catch (err) { console.error("Microphone access denied:", err); }
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
        setAudioPreviewUrl(null);
        setPreviewBlob(null);
        setIsPreviewPlaying(false);
        setRecordingTime(0);
        setIsSendingAudio(false);
    };

    const togglePreviewPlay = () => {
        if (!previewAudioRef.current) return;
        if (isPreviewPlaying) {
            previewAudioRef.current.pause();
            setIsPreviewPlaying(false);
        } else {
            previewAudioRef.current.play();
            setIsPreviewPlaying(true);
        }
    };

    const playSentAudio = (msgId, url) => {
        if (playingAudioId === msgId) {
            if (activeAudioElementRef.current) activeAudioElementRef.current.pause();
            setPlayingAudioId(null);
        } else {
            if (activeAudioElementRef.current) activeAudioElementRef.current.pause();
            const audio = new Audio(url);
            activeAudioElementRef.current = audio;
            setPlayingAudioId(msgId);
            audio.play();
            audio.onended = () => setPlayingAudioId(null);
        }
    };

    // Upload Handler for Multimedia Files
    const uploadFileToBackend = async (file, fileType) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("consultationId", consultationId);
        formData.append("senderId", currentPatientId || participants?.patient?._id);
        formData.append("senderType", "patient");
        formData.append("fileType", fileType);

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/chat/upload`, formData, {
                headers: { Authorization: `Bearer ${token}`, token, 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                if (socketRef.current) {
                    socketRef.current.emit("send_message", { consultationId, ...data.data });
                }
                // PRODUCTION FIX: Double check local array before appending to guarantee no UI clones
                setMessages(prev => {
                    if (prev.some(m => m?._id === data.data?._id)) return prev;
                    return [...prev, data.data];
                });
                discardVoiceNote();
            }
        } catch (error) { 
            console.error("Upload Error:", error); 
        } finally { 
            setUploading(false); 
            setIsSendingAudio(false);
        }
    };

    const sendVoiceNote = () => {
        if (!previewBlob || isSendingAudio) return;
        setIsSendingAudio(true); 
        const audioFile = new File([previewBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        uploadFileToBackend(audioFile, 'audio');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
        uploadFileToBackend(file, type);
    };

    const handleSendText = async (e) => {
        if (e) e.preventDefault();
        const finalId = currentPatientId || participants?.patient?._id;
        if (!message.trim() || !token || !finalId || isSendingText) return;

        setIsSendingText(true);
        const cleanText = message.trim();
        setMessage("");

        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/chat/send`, 
                { consultationId, senderId: finalId, senderType: 'patient', text: cleanText },
                { headers: { Authorization: `Bearer ${token}`, token } }
            );
            if (data.success) {
                if (socketRef.current) {
                    socketRef.current.emit("send_message", { consultationId, ...data.data });
                }
                // PRODUCTION FIX: Prevent dual insertion visually instantly
                setMessages(prev => {
                    if (prev.some(m => m?._id === data.data?._id)) return prev;
                    return [...prev, data.data];
                });
            }
        } catch (e) { 
            console.error("Text Send Error:", e); 
        } finally {
            setIsSendingText(false);
        }
    };

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

    const getInitials = (name) => name ? name.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'PT';

    const DynamicAvatar = ({ user, isMe }) => (
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${isMe ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
            {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
                <span className="text-white font-bold text-xs">{getInitials(user?.name)}</span>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 w-screen h-screen flex bg-[#efeae2] z-[9999] p-0 m-0 overflow-hidden">
            <div className="w-full h-full flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-4 shrink-0 bg-[#f0f2f5] z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-200 rounded-full text-slate-700">
                            <ChevronLeft size={24}/>
                        </button>
                        <DynamicAvatar user={participants?.doctor} isMe={false} />
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm md:text-base">{participants?.doctor?.name || 'Dhakhtar'}</h2>
                            <p className="text-xs text-emerald-600 font-medium">{isTyping ? "Wuu qorayaa..." : "Online"}</p>
                        </div>
                    </div>
                </header>

                {/* Chat Stream Area */}
                <main className="flex-1 overflow-y-auto px-4 py-4 md:px-12 flex flex-col gap-3">
                    <div className="mx-auto bg-white/80 border text-slate-600 text-[11px] px-3 py-1 rounded-md shadow-sm flex items-center gap-1">
                        <ShieldCheck size={13} className="text-emerald-600"/>(End-to-End Encrypted)
                    </div>

                    {messages.filter(m => m?.senderType).map((msg, idx) => {
                        const isMe = msg.senderType === 'patient';
                        const sender = isMe ? participants?.patient : participants?.doctor;

                        return (
                            <div key={idx} className={`flex w-full gap-2 my-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                
                                {!isMe && <DynamicAvatar user={sender} isMe={isMe} />}
                                
                                <div className={`relative max-w-[85%] md:max-w-[550px] shadow-sm rounded-lg text-sm ${
                                    isMe ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'
                                } ${msg.content?.fileType === 'text' ? 'px-3 py-2' : 'p-1'}`}>
                                    
                                    {/* TEXT TYPE */}
                                    {msg.content?.fileType === 'text' && (
                                        <p className="whitespace-pre-wrap break-words pr-12 text-[14px] leading-relaxed">{msg.content?.text}</p>
                                    )}

                                    {/* IMAGE TYPE */}
                                    {msg.content?.fileType === 'image' && (
                                        <img 
                                            src={msg.content.fileUrl} 
                                            className="rounded-md max-w-full max-h-72 object-cover border border-slate-100 cursor-pointer hover:brightness-95 transition-all" 
                                            onClick={() => setActiveImageUrl(msg.content.fileUrl)} 
                                            alt="Attachment"
                                        />
                                    )}

                                    {/* VIDEO TYPE */}
                                    {msg.content?.fileType === 'video' && (
                                        <video src={msg.content.fileUrl} controls className="rounded-md max-w-full max-h-72" />
                                    )}

                                    {/* AUDIO TYPE */}
                                    {msg.content?.fileType === 'audio' && (
                                        <div className="flex items-center gap-3 py-2 px-3 w-[260px] sm:w-[290px]">
                                            <button 
                                                type="button"
                                                onClick={() => playSentAudio(msg._id, msg.content.fileUrl)}
                                                className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 hover:bg-slate-300 active:scale-95 transition-all shadow-sm"
                                            >
                                                {playingAudioId === msg._id ? <Pause size={16} className="fill-current text-emerald-600" /> : <Play size={16} className="fill-current text-slate-600 ml-0.5" />}
                                            </button>
                                            
                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <div className="flex items-center gap-0.5 h-4 mb-0.5">
                                                    {[3,5,2,6,7,4,3,5,7,4,6,3,5,2,6,4].map((h, i) => (
                                                        <div 
                                                            key={i} 
                                                            className={`flex-1 rounded-sm transition-colors ${playingAudioId === msg._id ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} 
                                                            style={{ height: `${h * 2}px` }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] text-slate-500 truncate font-medium">Fariin Cod ah</span>
                                            </div>
                                            <Mic size={16} className="text-emerald-500 shrink-0 self-end mb-1" />
                                        </div>
                                    )}

                                    {/* Meta Time Row */}
                                    <div className="flex justify-end items-center gap-0.5 text-[9px] text-slate-400 font-medium mt-1 pr-1 pb-0.5">
                                        <span>{msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        {isMe && <CheckCheck size={12} className={msg.seen ? 'text-sky-500' : 'text-slate-400'} />}
                                    </div>
                                </div>

                                {isMe && <DynamicAvatar user={sender} isMe={isMe} />}
                            </div>
                        );
                    })}
                    {uploading && <div className="text-center text-xs text-slate-500 animate-pulse">Faylka baa la dirayaa...</div>}
                    <div ref={scrollRef} />
                </main>

                {/* Footer Input Controls */}
                <footer className="p-2 md:p-3 bg-[#f0f2f5] border-t flex items-center gap-2 shrink-0 z-10">
                    
                    {!isRecording && !audioPreviewUrl && (
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 bg-white rounded-lg px-2 py-1 flex items-center border border-slate-200">
                                <button type="button" onClick={() => fileInputRef.current.click()} disabled={isSendingText} className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50">
                                    <Paperclip size={20}/>
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                                
                                <input 
                                    value={message}
                                    disabled={isSendingText}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                        if (socketRef.current) socketRef.current.emit("typing", { consultationId, senderType: 'patient', typing: e.target.value.length > 0 });
                                    }}
                                    placeholder="Fariintaada qor..."
                                    className="w-full bg-transparent py-2 px-2 text-sm outline-none text-slate-800 disabled:opacity-60"
                                />
                            </div>

                            {message.trim() ? (
                                <button onClick={handleSendText} disabled={isSendingText} className="h-11 w-11 flex items-center justify-center bg-emerald-600 text-white rounded-full shadow-md active:scale-95 disabled:bg-slate-400 shrink-0">
                                    <Send size={18} className="ml-0.5"/>
                                </button>
                            ) : (
                                <button type="button" onClick={startRecording} disabled={isSendingText} className="h-11 w-11 flex items-center justify-center bg-slate-600 text-white rounded-full shadow-md hover:bg-slate-700 disabled:opacity-50 shrink-0">
                                    <Mic size={20}/>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Live Recording Panel */}
                    {isRecording && (
                        <div className="flex items-center justify-between w-full bg-white rounded-lg px-4 py-2 border border-red-200">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                                <span className="text-sm font-semibold text-red-600 tracking-wide">{formatTime(recordingTime)}</span>
                                <span className="text-xs text-slate-400">Codka baa la duubayaa...</span>
                            </div>
                            <button type="button" onClick={stopRecording} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                <Square size={16} className="fill-current"/>
                            </button>
                        </div>
                    )}

                    {/* Pre-listening Panel (Before Sending) */}
                    {audioPreviewUrl && (
                        <div className="flex items-center gap-3 w-full bg-white rounded-lg px-3 py-2 border border-emerald-200">
                            <button type="button" onClick={discardVoiceNote} disabled={isSendingAudio} className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors">
                                <Trash2 size={20} />
                            </button>

                            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border">
                                <button type="button" onClick={togglePreviewPlay} disabled={isSendingAudio} className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                                    {isPreviewPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current text-slate-600 ml-0.5" />}
                                </button>
                                <span className="text-xs text-slate-500 font-medium">Dhagayso kahor intaanad dirin</span>
                                <audio ref={previewAudioRef} src={audioPreviewUrl} onEnded={() => setIsPreviewPlaying(false)} className="hidden" />
                            </div>

                            <button 
                                type="button" 
                                onClick={sendVoiceNote} 
                                disabled={isSendingAudio} 
                                className="h-10 w-10 flex items-center justify-center bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 disabled:bg-slate-400 transition-colors shrink-0"
                            >
                                <Send size={16} className="ml-0.5" />
                            </button>
                        </div>
                    )}

                </footer>

                {/* In-App Image Fullscreen Preview Modal */}
                {activeImageUrl && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4">
                        <button 
                            type="button" 
                            onClick={() => setActiveImageUrl(null)} 
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={26} />
                        </button>
                        <img 
                            src={activeImageUrl} 
                            alt="Preview Fullscreen" 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default PatientChatPage;