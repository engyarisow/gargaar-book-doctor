import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Video, XCircle, Clock, Search, Copy, CheckCircle, User, Calendar, DollarSign, ShieldCheck } from 'lucide-react';

const DoctorConsultations = () => {
    const { dToken, consultations, getConsultations, cancelConsultation, completeConsultation } = useContext(DoctorContext);
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => { 
        if (dToken) getConsultations(); 
    }, [dToken]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        
        return () => clearInterval(timer);
    }, []);

    const isTimeForCall = (slotDate, slotTime) => {
        const apptTime = new Date(`${slotDate} ${slotTime}`);
        if (isNaN(apptTime.getTime())) return false;
        return currentTime >= apptTime && currentTime <= new Date(apptTime.getTime() + 60 * 60000);
    };

    const handleCopyId = (id) => {
        const cleanId = id.slice(-6).toUpperCase();
        navigator.clipboard.writeText(`CON-${cleanId}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredConsultations = [...consultations].reverse().filter((item) => {
        const name = (item.userData?.name || item.patientId?.name || '').toLowerCase();
        const id = `CON-${item._id?.slice(-6).toUpperCase()}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase());
    });

    return (
        <div className='p-4 sm:p-6 min-h-screen bg-slate-50/50 font-sans text-slate-800'>
            <div className='max-w-6xl mx-auto'>
                
                {/* Header Section */}
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
                    <div>
                        <h2 className='text-lg font-black text-slate-900'>Consultation Deck</h2>
                        <p className='text-xs text-slate-400 font-medium'>Efficiently manage your video sessions and patient flow.</p>
                    </div>
                    <div className='relative w-full md:w-72'>
                        <Search className='absolute left-3 top-2.5 text-slate-400' size={14} />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm'
                        />
                    </div>
                </div>

                {/* Table Card */}
                <div className='bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-slate-50 border-b border-slate-100'>
                                <tr className='text-[10px] uppercase font-black text-slate-400 tracking-wider'>
                                    <th className='px-5 py-4'>ID</th>
                                    <th className='px-5 py-4'>Patient</th>
                                    <th className='px-5 py-4 text-center'>Age</th>
                                    <th className='px-5 py-4'>Schedule</th>
                                    <th className='px-5 py-4 text-center'>Fees</th>
                                    <th className='px-5 py-4 text-right'>Status/Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-50'>
                                {filteredConsultations.map((item, index) => {
                                    const active = isTimeForCall(item.slotDate, item.slotTime);
                                    const shortId = `CON-${item._id?.slice(-6).toUpperCase()}`;
                                    const patientName = item.userData?.name || item.patientId?.name || 'Patient';
                                    const patientImage = item.userData?.image || item.patientId?.image;
                                    
                                    return (
                                        <tr key={index} className='hover:bg-blue-50/40 transition-colors group text-[11px] font-medium'>
                                            <td className='px-5 py-4'>
                                                <button onClick={() => handleCopyId(item._id)} className='flex items-center gap-1.5 font-mono text-slate-500 hover:text-blue-600'>
                                                    {shortId} {copiedId === item._id ? <CheckCircle size={10} className='text-emerald-500' /> : <Copy size={10} />}
                                                </button>
                                            </td>
                                            <td className='px-5 py-4 flex items-center gap-3'>
                                                <div className='relative flex-shrink-0'>
                                                    {patientImage && patientImage.length > 5 ? (
                                                        <img 
                                                            className='w-10 h-10 rounded-full object-cover border border-blue-100 bg-white shadow-sm' 
                                                            src={patientImage} 
                                                            alt={patientName} 
                                                        />
                                                    ) : (
                                                        <div className='w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm uppercase shadow-sm'>
                                                            {patientName ? patientName.trim().charAt(0) : '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className='text-xs font-bold text-slate-800'>{patientName}</p>
                                                </div>
                                            </td>
                                            <td className='px-5 py-4 text-center text-slate-500'>{calculateAge(item.userData?.dob || item.patientId?.dob)} yrs</td>
                                            <td className='px-5 py-4'>
                                                <div className='flex items-center gap-2'>
                                                    <Calendar size={12} className='text-blue-400' />
                                                    {slotDateFormat(item.slotDate)} <span className='text-slate-300'>|</span> {item.slotTime}
                                                </div>
                                            </td>
                                            <td className='px-5 py-4 text-center font-bold text-slate-700'>
                                                {currency}{item.amount || item.docInfo?.fees || '0'}
                                            </td>
                                            <td className='px-5 py-4 text-right'>
                                                {item.cancelled ? (
                                                    <span className='text-red-500 bg-red-50 px-2 py-1 rounded-md font-bold'>Cancelled</span>
                                                ) : item.isCompleted || item.status === 'completed' ? (
                                                    <div className='flex items-center justify-end gap-2'>
                                                        <span className='text-emerald-600 font-bold'>Completed</span>
                                                        <button onClick={() => navigate(`/doctor/chat/${item._id}`)} className='p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-blue-500 hover:text-white'><MessageCircle size={12} /></button>
                                                    </div>
                                                ) : item.status === 'active' ? (
                                                    active ? (
                                                        <button onClick={() => navigate(`/video-call/${item._id}`)} className='bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 animate-pulse'>
                                                            Join Call
                                                        </button>
                                                    ) : (
                                                        <span className='text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md'>Waiting</span>
                                                    )
                                                ) : (
                                                    <div className='flex items-center justify-end gap-2'>
                                                        <button onClick={() => cancelConsultation(item._id)} className='p-1.5 text-red-400 hover:bg-red-50 rounded-lg'><XCircle size={14} /></button>
                                                        <button onClick={() => completeConsultation(item._id)} className='bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-black'>Accept</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorConsultations;