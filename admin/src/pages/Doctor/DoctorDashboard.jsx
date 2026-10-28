import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const DoctorDashboard = () => {
    const { 
        dToken, 
        dashData, 
        getDashData, 
        cancelAppointments, 
        completeAppointments,
        cancelConsultation,    
        completeConsultation,
        acceptConsultation 
    } = useContext(DoctorContext);
    
    const { currency, slotDateFormat } = useContext(AppContext);
    const navigate = useNavigate();

    const [currentTime, setCurrentTime] = useState(new Date());

    // Fetch data when token is ready
    useEffect(() => {
        if (dToken) {
            getDashData();
        }
    }, [dToken]); 

    // Real-time clock for appointment checks
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const isTimeForCall = (slotDate, slotTime) => {
        const apptTime = new Date(`${slotDate} ${slotTime}`);
        if (isNaN(apptTime.getTime())) return false; 
        
        // Opens 5 mins before, closes 60 mins after
        return currentTime >= new Date(apptTime.getTime() - 5 * 60000) && currentTime <= new Date(apptTime.getTime() + 60 * 60000);
    };

    const handleCancel = (item) => {
        const id = item.appointmentId || item.consultationId || item._id;
        if (item.type === 'consultation') {
            if (cancelConsultation) cancelConsultation(id);
        } else {
            if (cancelAppointments) cancelAppointments(id);
        }
    };

    const handleComplete = (item) => {
        const id = item.appointmentId || item.consultationId || item._id;
        if (item.type === 'consultation') {
            if (completeConsultation) completeConsultation(id);
        } else {
            if (completeAppointments) completeAppointments(id);
        }
    };

    const handleAccept = (item) => {
        const id = item.consultationId || item._id;
        if (acceptConsultation) {
            acceptConsultation(id);
        } else {
            handleComplete(item);
        }
    };

    const getAvatarGradient = (name) => {
        if (!name) return 'from-blue-500 to-indigo-500';
        const charCode = name.charCodeAt(0);
        if (charCode % 3 === 0) return 'from-blue-500 to-cyan-400';
        if (charCode % 3 === 1) return 'from-purple-500 to-indigo-500';
        return 'from-emerald-500 to-teal-400';
    };

    const parseTimeTo24h = (timeStr) => {
        if (!timeStr) return 0;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier?.toLowerCase() === 'pm') hours = parseInt(hours, 10) + 12;
        return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    };

    // Show loading state if data is fetching
    if (!dashData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Map exact backend data to local variables
    const totalEarnings = dashData.earnings || 0;
    const clinicEarnings = dashData.clinicEarnings || 0;
    const videoEarnings = dashData.videoEarnings || 0;
    
    const totalPatients = dashData.patients || 0;
    const totalClinicAppointments = dashData.appointments || 0;
    const totalVideoConsultations = dashData.consultations || 0; 

    const sortedAppointments = dashData.latestAppointments ? [...dashData.latestAppointments].sort((a, b) => {
        const dateA = new Date(a.slotDate);
        const dateB = new Date(b.slotDate);
        if (dateB - dateA !== 0) return dateB - dateA;
        return parseTimeTo24h(b.slotTime) - parseTimeTo24h(a.slotTime);
    }) : [];

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const statCards = [
        { 
            label: 'Total Patients', 
            desc: '',
            val: totalPatients, 
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m-8-4a4 4 0 110-8 4 4 0 010 8zm8-4a3 3 0 110-6 3 3 0 010 6z' 
        },
        { 
            label: 'Visit Appts', 
            desc: 'In-person visits',
            val: totalClinicAppointments, 
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
        },
        { 
            label: 'Video Consults', 
            desc: 'Online consult',
            val: totalVideoConsultations, 
            icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' 
        }
    ];

    return (
        <div className='bg-[#F8FAFC] text-slate-800 p-4 font-sans max-w-7xl mx-auto'>
            
            {/* Header */}
            <div className='flex flex-row justify-between items-center mb-4'>
                <div>
                    <h1 className='text-lg font-black text-slate-900 tracking-tight'>Doctor Dashboard</h1>
                    <p className='text-[10px] font-bold text-blue-500/80 uppercase tracking-widest flex items-center gap-1.5'>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {today}
                    </p>
                </div>
                <div className='hidden sm:flex items-center gap-2 bg-white px-2.5 py-1 rounded-full shadow-sm border border-blue-100'>
                    <span className='text-[9px] font-bold text-slate-500 uppercase'>Portal Status:</span>
                    <span className='text-[9px] font-bold text-emerald-500'>Online</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-5'>
                
                {/* Main Revenue Card */}
                <div className='md:col-span-2 relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-xl p-4 overflow-hidden shadow-md text-white flex flex-col justify-between border border-blue-700/50 min-h-[130px]'>
                    <div className='absolute -right-8 -top-8 flex opacity-10 pointer-events-none'>
                        <div className='w-32 h-32 rounded-full bg-white -mr-16 z-10'></div>
                        <div className='w-32 h-32 rounded-full bg-white'></div>
                    </div>

                    <div className='flex justify-between items-start relative z-20 mb-2'>
                        <div className='w-9 h-6 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md p-0.5 shadow-sm flex flex-col justify-between border border-yellow-700/50 opacity-90'>
                            <div className='flex justify-between w-full h-full border border-yellow-700/30 rounded-sm opacity-60'>
                                <div className='w-full h-px bg-yellow-700/40 my-auto'></div>
                            </div>
                        </div>
                        <p className='text-[9px] font-bold text-blue-200 uppercase tracking-widest'>Earnings Card</p>
                    </div>

                    <div className='relative z-20 mb-3'>
                        <p className='text-[8px] text-blue-200 uppercase tracking-[0.2em] mb-0.5 font-medium'>Total Earnings</p>
                        <h2 className='text-2xl font-black tracking-widest drop-shadow-md font-mono'>
                            {currency}{totalEarnings.toLocaleString()}
                        </h2>
                    </div>

                    <div className='flex justify-between items-end relative z-20 mt-auto'>
                        <div className='flex gap-4 font-mono'>
                            <div>
                                <p className='text-[8px] text-blue-300 uppercase tracking-widest mb-0.5'>Visit</p>
                                <p className='text-xs font-bold tracking-wider'>{currency}{clinicEarnings.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className='text-[8px] text-blue-300 uppercase tracking-widest mb-0.5'>Video</p>
                                <p className='text-xs font-bold tracking-wider'>{currency}{videoEarnings.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className='flex items-center opacity-90 drop-shadow-sm'>
                            <div className='w-6 h-6 rounded-full bg-white/70 -mr-2.5 z-10 backdrop-blur-sm'></div>
                            <div className='w-6 h-6 rounded-full bg-blue-300/70 backdrop-blur-sm'></div>
                        </div>
                    </div>
                </div>

                {/* Thematic Mini Stats */}
                {statCards.map((item, i) => (
                    <div key={i} className='bg-white rounded-xl p-4 border border-blue-50 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 relative overflow-hidden group'>
                        <div className='absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none'>
                            <svg className="w-20 h-20 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                        </div>

                        <div className='flex justify-between items-start relative z-10 mb-2'>
                            <div>
                                <p className='text-2xl font-black text-blue-900 tracking-tight leading-none mb-1'>{item.val}</p>
                                <p className='text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mt-1'>{item.label}</p>
                                <p className='text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5'>{item.desc}</p>
                            </div>
                            <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300'>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                                </svg>
                            </div>
                        </div>

                        <div className='w-full h-1 bg-slate-100 rounded-full overflow-hidden relative z-10 mt-auto'>
                            <div className='h-full bg-blue-500 rounded-full w-1/3 group-hover:w-full transition-all duration-500 ease-out'></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Table Section */}
            <div className='bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden'>
                <div className='px-4 py-3 border-b border-blue-50 flex justify-between items-center bg-blue-50/30'>
                    <h3 className='font-bold text-xs text-blue-900 flex items-center gap-2'>
                        Latest Bookings
                        <span className='px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded-full font-black'>{sortedAppointments.length}</span>
                    </h3>
                </div>

                <div className='divide-y divide-blue-50'>
                    {sortedAppointments.length > 0 ? sortedAppointments.map((item) => {
                        const targetId = item.appointmentId || item.consultationId || item._id;
                        
                        const isCancelled = item.cancelled || item.status === 'cancelled';
                        const isCompleted = item.isCompleted || item.status === 'completed' || item.status === 'follow-up';
                        const isActive = item.status === 'active';
                        const isTimeCall = isTimeForCall(item.slotDate, item.slotTime);
                        const isConsult = item.type === 'consultation';
                        
                        const displayId = `${isConsult ? 'CON' : 'APP'}-${targetId.slice(-6).toUpperCase()}`;
                        const patientName = item.userData?.name || 'Patient User';
                        const patientImage = item.userData?.image;

                        return (
                            <div key={targetId} className='p-3 hover:bg-blue-50/40 transition-colors'>
                                <div className='grid grid-cols-1 md:grid-cols-12 gap-3 items-center'>
                                    
                                    {/* Patient Info */}
                                    <div className='md:col-span-4 flex items-center gap-2.5'>
                                        <div className='relative flex-shrink-0'>
                                            {patientImage && patientImage.length > 5 ? (
                                                <img className='w-8 h-8 rounded-full object-cover border border-blue-100 bg-white' src={patientImage} alt="User" />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full bg-blue-500 ${getAvatarGradient(patientName)} flex items-center justify-center text-white font-bold text-[10px] uppercase border border-white`}>
                                                    {patientName.trim().charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className='font-bold text-xs text-slate-800 leading-none mb-0.5'>{patientName}</p>
                                            <p className='text-[9px] font-mono text-blue-400'>{displayId}</p>
                                        </div>
                                    </div>

                                    {/* Date/Time */}
                                    <div className='md:col-span-3'>
                                        <div className='flex items-center gap-1 text-xs font-bold text-slate-700'>
                                            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            {slotDateFormat(item.slotDate)}
                                        </div>
                                        <p className='text-[9px] font-medium text-slate-400 ml-4 mt-0.5'>{item.slotTime}</p>
                                    </div>

                                    {/* Type Badge */}
                                    <div className='md:col-span-2'>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${isConsult ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                            {isConsult ? 'Video' : 'Clinic'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className='md:col-span-3 flex justify-end gap-1.5 items-center'>
                                        {isCancelled ? (
                                            <span className='text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100'>Cancelled</span>
                                        ) : isCompleted ? (
                                            <div className='flex items-center gap-1.5'>
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Completed</span>
                                                {isConsult && (
                                                    <button 
                                                        onClick={() => navigate(`/doctor/chat/${targetId}`)} 
                                                        className='p-1 text-blue-500 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-all' 
                                                        title="Open Secure Room"
                                                    >
                                                        <MessageCircle size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : isConsult ? (
                                            (!isActive && !isTimeCall) ? (
                                                <div className='flex items-center gap-1.5'>
                                                    <button onClick={() => handleCancel(item)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-all" title="Decline">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleAccept(item)} className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide transition-all">
                                                        Accept
                                                    </button>
                                                </div>
                                            ) : (
                                                isTimeCall ? (
                                                    <div className='flex items-center gap-1.5'>
                                                        <button 
                                                            onClick={() => navigate(`/video-call/${targetId}`)}
                                                            className='bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 transition-all tracking-wide uppercase'
                                                        >
                                                            <span className='w-1 h-1 bg-white rounded-full animate-ping' />
                                                            Join Call
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                                        Wait
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleCancel(item)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-all" title="Cancel Appointment">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                                <button onClick={() => handleComplete(item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-all" title="Complete Appointment">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className='p-14 text-center text-blue-300 text-[10px] font-bold uppercase tracking-widest'>No records found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;