import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { MessageCircle, Image as ImageIcon, Mic, Video, CheckCheck, Inbox, Search, Edit, MoreHorizontal, BellOff } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const AllMessagesPage = () => {
    const { token, userData } = useContext(AppContext);
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await axios.get(`${BACKEND_URL}/api/chat/conversations`, {
                    headers: { Authorization: `Bearer ${token}`, token }
                });
                if (data.success) {
                    const sortedConversations = data.conversations.sort((a, b) => {
                        const timeA = a.lastMessage?.time ? new Date(a.lastMessage.time).getTime() : 0;
                        const timeB = b.lastMessage?.time ? new Date(b.lastMessage.time).getTime() : 0;
                        return timeB - timeA;
                    });
                    
                    setConversations(sortedConversations);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        if (token) fetchConversations();
    }, [token]);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        
        return isToday 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const renderLastMessagePreview = (lastMessage) => {
        if (!lastMessage) return "Wali fariin lama isku dirin...";
        const isMe = lastMessage.senderId === userData?._id;
        const prefix = isMe ? "Adiga: " : "";

        switch (lastMessage.content?.fileType) {
            case 'image':
                return <span className="flex items-center gap-1.5"><ImageIcon size={16} className="text-slate-400 shrink-0"/> {prefix}Sawir</span>;
            case 'audio':
                return <span className="flex items-center gap-1.5"><Mic size={16} className="text-emerald-500 shrink-0"/> {prefix}Cod</span>;
            case 'video':
                return <span className="flex items-center gap-1.5"><Video size={16} className="text-sky-500 shrink-0"/> {prefix}Muuqaal</span>;
            default:
                return <span className="truncate">{prefix}{lastMessage.content?.text}</span>;
        }
    };

    // Edge-to-Edge Skeleton Loader
    if (loading) return (
        <div className="w-full h-screen bg-white flex flex-col relative overflow-hidden">
            <div className="px-6 md:px-12 lg:px-20 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                <div className="w-48 h-9 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="flex gap-4">
                    <div className="w-11 h-11 bg-slate-100 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden w-full">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center px-6 md:px-12 lg:px-20 py-4 border-b border-slate-50 w-full">
                        <div className="w-16 h-16 rounded-full bg-slate-100 animate-pulse shrink-0"></div>
                        <div className="ml-5 flex-1 space-y-3">
                            <div className="flex justify-between">
                                <div className="w-1/5 h-4 bg-slate-100 rounded animate-pulse"></div>
                                <div className="w-16 h-3 bg-slate-50 rounded animate-pulse"></div>
                            </div>
                            <div className="w-2/5 h-3 bg-slate-50 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        // Wuxuu qaadanayaa shaashadda oo dhan, ballac (w-full) iyo dherer (h-screen)
        <div className="w-full h-screen bg-white flex flex-col relative antialiased selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
            
            {/* Header: Edge-to-Edge Padding */}
            <header className="px-6 md:px-12 lg:px-20 py-5 md:py-6 bg-white/90 backdrop-blur-2xl shrink-0 z-30 flex items-center justify-between border-b border-slate-100 supports-[backdrop-filter]:bg-white/60 w-full">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    Fariimaha
                </h1>
                <div className="flex items-center gap-3 md:gap-4">
                    <button className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 duration-200 bg-slate-50">
                        <Search size={22} strokeWidth={2.5} />
                    </button>
                    <button className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95 duration-200">
                        <Edit size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            {/* Chat List: Hadda ma laha max-w, waa 100% full width */}
            <main className="flex-1 overflow-y-auto w-full bg-white">
                {conversations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-emerald-100 blur-3xl opacity-50 rounded-full"></div>
                            <div className="relative w-32 h-32 bg-gradient-to-tr from-slate-50 to-white border border-slate-100 rounded-[2.5rem] rotate-3 flex items-center justify-center shadow-2xl shadow-slate-200/50">
                                <MessageCircle className="w-14 h-14 text-slate-300 -rotate-3" strokeWidth={1.5} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Cidna lamaadan hadlin</h3>
                        <p className="text-slate-500 max-w-md leading-relaxed text-lg">Markaad la xiriirto dhakhaatiirta ama bukaanada, fariimaha halkan ayay si toos ah uga soo muuqan doonaan.</p>
                    </div>
                ) : (
                    <div className="w-full flex flex-col pb-20">
                        {conversations.map((conv, index) => {
                            const otherUser = conv.participants?.doctor?._id === userData?._id ? conv.participants?.patient : conv.participants?.doctor;
                            const unreadCount = conv.unreadCount || 0;
                            const isUnread = unreadCount > 0;
                            const isOnline = true; 

                            return (
                                <div 
                                    key={conv._id}
                                    onClick={() => navigate(`/chat/${conv._id}`)}
                                    // Edge-to-Edge List Item Style
                                    className={`group relative flex items-center px-6 md:px-12 lg:px-20 py-4 md:py-5 w-full cursor-pointer transition-all duration-200 ease-out border-b border-slate-100 hover:bg-slate-50/80 active:bg-slate-100 animate-in slide-in-from-bottom-2 fade-in fill-mode-both ${isUnread ? 'bg-emerald-50/20' : ''}`}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden p-[2px] transition-all duration-300 ${isUnread ? 'bg-gradient-to-tr from-emerald-400 to-sky-400 shadow-md shadow-emerald-200/50' : 'bg-transparent'}`}>
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-100">
                                                {otherUser?.image ? (
                                                    <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 text-slate-500 font-bold text-xl md:text-2xl">
                                                        {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 md:bottom-1 md:right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm"></div>
                                        )}
                                    </div>

                                    {/* Chat Content */}
                                    <div className="ml-4 md:ml-6 flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-1">
                                            <h2 className={`text-[17px] md:text-[19px] tracking-tight truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                {otherUser?.name || 'Magac la\'aan'}
                                            </h2>
                                            <span className={`text-[13px] md:text-[14px] ml-4 shrink-0 ${isUnread ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
                                                {formatTime(conv.lastMessage?.time)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className={`text-[15px] md:text-[16px] truncate pr-6 flex items-center gap-2 ${isUnread ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                                                {conv.lastMessage?.senderId === userData?._id && (
                                                    <CheckCheck 
                                                        size={18} 
                                                        strokeWidth={2.5}
                                                        className={`shrink-0 ${conv.lastMessage?.seen ? 'text-sky-500' : 'text-slate-300'}`} 
                                                    />
                                                )}
                                                {renderLastMessagePreview(conv.lastMessage)}
                                            </div>
                                            
                                            {/* Actions & Badges */}
                                            <div className="flex items-center gap-3">
                                                <div className="hidden md:flex opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 gap-1.5 mr-2">
                                                    <button className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                                                        <BellOff size={18} />
                                                    </button>
                                                    <button className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>

                                                {isUnread && (
                                                    <div className="min-w-[28px] h-[28px] px-2.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[13px] font-bold shadow-md shadow-emerald-200/50 shrink-0">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllMessagesPage;