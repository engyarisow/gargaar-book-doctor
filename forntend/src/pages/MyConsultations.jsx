import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Search, Copy, CheckCircle } from 'lucide-react';

const MyConsultations = () => {
    const { backendUrl, token, getDoctorsData } = useContext(AppContext);
    const [consultations, setConsultations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const navigate = useNavigate();

    // Logic: Allowed to join EXACTLY at start time until 60 mins after start
    const isTimeForCall = (slotDate, slotTime) => {
        const now = new Date();
        const apptTime = new Date(`${slotDate} ${slotTime}`);
        // Wuxuu furmayaa waqtiga saxda ah (now >= apptTime)
        return now >= apptTime && now <= new Date(apptTime.getTime() + 60 * 60000);
    };

    // Generates a consistent luxury gradient based on the doctor's name string hash
    const getAvatarGradient = (name) => {
        if (!name) return 'from-slate-400 to-slate-500';
        const gradients = [
            'from-sky-400 to-indigo-500',
            'from-emerald-400 to-teal-600',
            'from-violet-400 to-purple-600',
            'from-rose-400 to-pink-600',
            'from-amber-400 to-orange-500',
            'from-cyan-400 to-blue-600'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    };

    const handleCopyId = (id) => {
        const cleanId = `CON-${id.slice(-6).toUpperCase()}`;
        navigator.clipboard.writeText(cleanId);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getUserConsultations = async () => {
        try {
            if (!token) return;
            const { data } = await axios.get(`${backendUrl}/api/user/consultations`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (data.success) {
                setConsultations(data.consultations.slice().reverse());
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error(error.response?.data?.message || "Cillad ayaa dhacday");
        }
    };

    const cancelConsultation = async (id) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/cancel-consultation`, 
                { consultationId: id }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) { 
                toast.success(data.message); 
                getUserConsultations(); 
                if (typeof getDoctorsData === 'function') getDoctorsData(); 
            }
        } catch (error) { 
            console.error("Cancel Error:", error);
            toast.error(error.response?.data?.message || "Ma suurtagalin in la baajiyo"); 
        }
    };

    useEffect(() => { 
        if (token) getUserConsultations(); 
    }, [token]);

    // Live search functionality
    const filteredConsultations = consultations.filter((item) => {
        const docName = (item.docData?.name || '').toLowerCase();
        const shortId = `CON-${item._id?.slice(-6).toUpperCase()}`.toLowerCase();
        const rawId = item._id?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return docName.includes(search) || shortId.includes(search) || rawId.includes(search);
    });

    return (
        <div className='max-w-4xl mx-auto p-4'>
            {/* Header Control Row with original spacing and added Search Bar */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pb-2 border-b'>
                <p className='font-semibold text-zinc-700'>My Video Consultations</p>
                
                {/* Clean Search Input */}
                <div className='relative min-w-[260px]'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
                    <input 
                        type="text" 
                        placeholder="Search Doctor or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all'
                    />
                </div>
            </div>

            <div className='mt-4 space-y-3'>
                {filteredConsultations.length > 0 ? (
                    filteredConsultations.map((item, index) => {
                        const shortId = `CON-${item._id?.slice(-6).toUpperCase()}`;
                        const docName = item.docData?.name || '';
                        const docImage = item.docData?.image;

                        return (
                            <div key={index} className='flex items-center gap-4 p-3 border rounded-lg bg-white shadow-sm text-sm'>
                                {/* Image with original design or Luxury Gradient Fallback */}
                                {docImage && docImage.length > 5 ? (
                                    <img className='w-20 h-20 object-cover bg-indigo-50 rounded-md border' src={docImage} alt="" />
                                ) : (
                                    <div className={`w-20 h-20 min-w-[80px] rounded-md bg-gradient-to-br ${getAvatarGradient(docName)} flex items-center justify-center text-white font-bold text-2xl uppercase tracking-tight border`}>
                                        {docName ? docName.trim().charAt(0) : 'D'}
                                    </div>
                                )}
                                
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <p className='text-zinc-800 font-bold'>{docName}</p>
                                        
                                        {/* --- INTERACTIVE COPYABLE ID BADGE --- */}
                                        <button 
                                            onClick={() => handleCopyId(item._id)}
                                            className={`group/id flex items-center gap-1 font-mono text-[9px] border px-1.5 py-0.5 rounded font-bold tracking-wide transition-all active:scale-95 ${
                                                copiedId === item._id 
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                            }`}
                                            title="Click to copy ID"
                                        >
                                            <span>{shortId}</span>
                                            {copiedId === item._id ? (
                                                <CheckCircle size={9} className="text-emerald-500" />
                                            ) : (
                                                <Copy size={9} className="text-slate-400 group-hover/id:text-slate-600" />
                                            )}
                                        </button>
                                    </div>

                                    <p className='text-primary text-xs mb-1'>{item.docData.speciality}</p>
                                    <p className='text-xs text-zinc-500 font-medium'>{item.slotDate} | <span className='text-zinc-400'>{item.slotTime}</span></p>
                                    
                                    {/* Status Badges */}
                                    <div className='mt-2'>
                                        {item.status === 'pending' && <span className='text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 uppercase font-bold'>Waiting for Doctor</span>}
                                        {item.status === 'scheduled' && <span className='text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase font-bold'>Upcoming</span>}
                                        {item.status === 'in-progress' && <span className='text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase font-bold animate-pulse'>Live Now</span>}
                                        {item.status === 'completed' && <span className='text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200 uppercase font-bold'>Completed</span>}
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1.5 w-32'>
                                    {/* JOIN BUTTON: Active if scheduled or in-progress AND within exact time window */}
                                    {!item.cancelled && !item.isCompleted && item.status !== 'follow-up' && (
                                        <button 
                                            onClick={() => navigate(`/video-call/${item._id}`)} 
                                            disabled={!isTimeForCall(item.slotDate, item.slotTime)}
                                            className={`py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                                                isTimeForCall(item.slotDate, item.slotTime) 
                                                ? 'bg-primary text-white shadow-md hover:bg-opacity-90' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}>
                                            {isTimeForCall(item.slotDate, item.slotTime) ? 'Join Call' : 'wait time'}
                                        </button>
                                    )}

                                    {/* CANCEL BUTTON: Only if pending or scheduled */}
                                    {!item.cancelled && (item.status === 'pending' || item.status === 'scheduled') && (
                                        <button 
                                            onClick={() => cancelConsultation(item._id)} 
                                            className='py-1.5 border border-zinc-200 rounded-md text-xs font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all'>
                                            Cancel
                                        </button>
                                    )}

                                    {/* CANCELLED STATE */}
                                    {item.cancelled && (
                                        <span className='text-center py-1.5 text-red-500 bg-red-50 border border-red-100 rounded-md text-[11px] font-bold uppercase'>
                                            Cancelled
                                        </span>
                                    )}
                                    
                                    {/* COMPLETED STATE & 7-DAY CHAT */}
                                    {(item.isCompleted || item.status === 'follow-up') && !item.cancelled && (
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-center py-1.5 text-green-600 bg-green-50 border border-green-100 rounded-md text-[11px] font-bold uppercase'>
                                                Completed
                                            </span>
                                            
                                            {/* 7-Day Support Window Logic */}
                                            {item.supportWindow?.expiresAt && new Date(item.supportWindow.expiresAt) > new Date() ? (
                                                <button 
                                                    onClick={() => navigate(`/chat/${item._id}`)}
                                                    className='py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 transition-all text-center uppercase mt-1'>
                                                    💬 Open Chat
                                                </button>
                                            ) : (
                                                <span className='text-[9px] text-zinc-400 text-center italic mt-1'>
                                                    Chat Support Expired
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='text-center py-8 text-slate-400 font-medium text-xs bg-slate-50 rounded-lg border border-dashed'>
                        Waxba laguma helin raadintaada.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyConsultations;