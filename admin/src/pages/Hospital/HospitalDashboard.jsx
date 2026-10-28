import React, { useContext, useEffect } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { AppContext } from '../../context/AppContext';

// Helper function to generate dynamic gradients based on name initials
const getAvatarGradient = (name) => {
    const firstChar = name ? name.trim().charAt(0).toUpperCase() : 'U';
    const charCode = firstChar.charCodeAt(0);
    if (charCode < 69) return 'bg-gradient-to-br from-blue-500 to-indigo-600';   // A - D
    if (charCode < 74) return 'bg-gradient-to-br from-emerald-500 to-teal-600'; // E - I
    if (charCode < 79) return 'bg-gradient-to-br from-amber-500 to-orange-600'; // J - N
    if (charCode < 84) return 'bg-gradient-to-br from-rose-500 to-pink-600';   // O - S
    return 'bg-gradient-to-br from-violet-500 to-purple-600';                 // T - Z & others
};

const HospitalDashboard = () => {
    const { 
        hToken, getDashData, dashData 
    } = useContext(HospitalContext);
    
    const { currency, slotDateFormat } = useContext(AppContext);

    useEffect(() => {
        if (hToken) getDashData();
    }, [hToken]);

    // Safety check for data
    const latestAppointments = dashData?.latestAppointments || [];
    
    // Safety Net: Counts video consultations directly if backend key mismatches
    const videoCount = dashData?.consultationAppointments || 
                       dashData?.videoConsults || 
                       latestAppointments.filter(item => item.type === 'consultation').length || 0;

    // Strict Backend Earnings
    const finalTotalEarnings = dashData?.totalEarnings || 0;
    const finalHospitalEarnings = dashData?.hospitalEarnings || 0;
    const finalVideoEarnings = dashData?.consultationEarnings || dashData?.videoEarnings || 0;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // Thematic Blue & White Cards Data
    const statCards = [
        { 
            label: 'Patients', 
            desc: '',
            val: dashData?.patients || 0, 
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m-8-4a4 4 0 110-8 4 4 0 010 8zm8-4a3 3 0 110-6 3 3 0 010 6z' 
        },
        { 
            label: 'Doctors', 
            desc: '',
            val: dashData?.doctors || 0, 
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' 
        },
        { 
            label: 'Visit Appts', 
            desc: '',
            val: dashData?.hospitalAppointments || 0, 
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
        },
        { 
            label: 'Video Consults', 
            desc: '',
            val: videoCount, 
            icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z' 
        }
    ];

    return dashData && (
        <div className='min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 font-sans'>
            
            {/* --- TOP NAV / HEADER --- */}
            <div className='flex flex-row justify-between items-center mb-6'>
                <div>
                    <h1 className='text-xl font-extrabold text-slate-900 tracking-tight'>Dashboard</h1>
                    <p className='text-[11px] font-semibold text-blue-500/80 uppercase tracking-widest flex items-center gap-1.5'>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {today}
                    </p>
                </div>
                <div className='hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100'>
                    <span className='text-[10px] font-bold text-slate-500 uppercase'>Server Status:</span>
                    <span className='text-[10px] font-bold text-emerald-500'>online</span>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8'>
                
                {/* 1. MAIN REVENUE CARD */}
                <div className='col-span-2 relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-[20px] p-5 overflow-hidden shadow-xl shadow-blue-900/20 text-white flex flex-col justify-between border border-blue-700/50 min-h-[160px]'>
                    <div className='absolute -right-8 -top-8 flex opacity-10 pointer-events-none'>
                        <div className='w-40 h-40 rounded-full bg-white -mr-16 z-10'></div>
                        <div className='w-40 h-40 rounded-full bg-white'></div>
                    </div>

                    <div className='flex justify-between items-start relative z-20 mb-4'>
                        <div className='w-11 h-8 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md p-1 shadow-sm flex flex-col justify-between border border-yellow-700/50 opacity-90'>
                            <div className='flex justify-between w-full h-full border border-yellow-700/30 rounded-sm opacity-60'>
                                <div className='w-full h-px bg-yellow-700/40 my-auto'></div>
                            </div>
                        </div>
                        <p className='text-[10px] font-bold text-blue-200 uppercase tracking-widest'>Revenue Card</p>
                    </div>

                    <div className='relative z-20 mb-6'>
                        <p className='text-[9px] text-blue-200 uppercase tracking-[0.2em] mb-1 font-medium'>Total Balance</p>
                        <h2 className='text-3xl font-black tracking-widest drop-shadow-md font-mono'>
                            {currency}{finalTotalEarnings.toLocaleString()}
                        </h2>
                    </div>

                    <div className='flex justify-between items-end relative z-20 mt-auto'>
                        <div className='flex gap-6 font-mono'>
                            <div>
                                <p className='text-[8px] text-blue-300 uppercase tracking-widest mb-0.5'>Visit</p>
                                <p className='text-xs font-bold tracking-wider'>{currency}{finalHospitalEarnings.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className='text-[8px] text-blue-300 uppercase tracking-widest mb-0.5'>Video</p>
                                <p className='text-xs font-bold tracking-wider'>{currency}{finalVideoEarnings.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className='flex items-center opacity-90 drop-shadow-sm'>
                            <div className='w-7 h-7 rounded-full bg-white/70 -mr-3 z-10 backdrop-blur-sm'></div>
                            <div className='w-7 h-7 rounded-full bg-blue-300/70 backdrop-blur-sm'></div>
                        </div>
                    </div>
                </div>

                {/* 2. MINI STAT CARDS */}
                {statCards.map((item, i) => (
                    <div key={i} className='bg-white rounded-[20px] p-5 border border-blue-50 shadow-sm shadow-blue-100/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:shadow-blue-200/40 hover:border-blue-200 transition-all duration-300 relative overflow-hidden group'>
                        <div className='absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none'>
                            <svg className="w-28 h-28 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                        </div>

                        <div className='flex justify-between items-start relative z-10 mb-4'>
                            <div>
                                <p className='text-3xl font-black text-blue-900 tracking-tight leading-none mb-1'>{item.val}</p>
                                <p className='text-[11px] font-extrabold text-blue-600 uppercase tracking-wider'>{item.label}</p>
                                <p className='text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5'>{item.desc}</p>
                            </div>
                            <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300'>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* --- DATA TABLE SECTION --- */}
            <div className='bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 overflow-hidden'>
                <div className='px-5 py-4 border-b border-blue-50 flex justify-between items-center bg-blue-50/30'>
                    <h3 className='font-bold text-sm text-blue-900 flex items-center gap-2'>
                        Recent Appointments
                        <span className='px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-black'>{latestAppointments.length}</span>
                    </h3>
                    <button className='text-[10px] font-bold text-blue-600 hover:underline'>View All</button>
                </div>

                <div className='divide-y divide-blue-50'>
                    {latestAppointments.length > 0 ? latestAppointments.map((item, index) => {
                        const isConsult = item.type === 'consultation';
                        const displayId = `${isConsult ? 'CON' : 'APP'}-${item._id?.slice(-6).toUpperCase()}`;
                        
                        // Patient Info
                        const patientImage = item.userData?.image || '';
                        const patientName = item.userData?.name || 'Unknown Patient';

                        // Doctor Info
                        const docImage = item.docData?.image || '';
                        const docName = item.docData?.name || 'Unknown Doctor';
                        
                        return (
                            <div key={index} className='p-4 hover:bg-blue-50/40 transition-colors'>
                                <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-center'>
                                    
                                    {/* --- PATIENT INFO --- */}
                                    <div className='md:col-span-3 flex items-center gap-3'>
                                        <div className='relative flex-shrink-0'>
                                            {patientImage && patientImage.length > 5 ? (
                                                <img className='w-10 h-10 rounded-full object-cover border border-blue-100 bg-white shadow-sm' src={patientImage} alt="Patient" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full ${getAvatarGradient(patientName)} flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm border border-white`}>
                                                    {patientName.trim().charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className='truncate'>
                                            <span className='text-[9px] font-extrabold text-blue-500 uppercase tracking-wider block mb-0.5'>Patient</span>
                                            <p className='font-bold text-sm text-slate-800 leading-none truncate'>{patientName}</p>
                                            <p className='text-[10px] font-mono text-slate-400 mt-1'>{displayId}</p>
                                        </div>
                                    </div>

                                    {/* --- DOCTOR INFO --- */}
                                    <div className='md:col-span-3 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4'>
                                        <div className='relative flex-shrink-0'>
                                            {docImage && docImage.length > 5 ? (
                                                <img className='w-10 h-10 rounded-full object-cover border border-blue-100 bg-white shadow-sm' src={docImage} alt="Doctor" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full ${getAvatarGradient(docName)} flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm border border-white`}>
                                                    {docName.trim().charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className='truncate'>
                                            <span className='text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-0.5'>Doctor</span>
                                            <p className='font-bold text-sm text-slate-800 leading-none truncate'>{docName}</p>
                                            <p className='text-[10px] font-medium text-slate-400 mt-1 truncate'>{item.docData?.speciality || 'Specialist'}</p>
                                        </div>
                                    </div>

                                    {/* --- DATE & TIME --- */}
                                    <div className='md:col-span-3'>
                                        <div className='flex items-center gap-1.5 text-xs font-bold text-slate-700'>
                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            {slotDateFormat(item.slotDate)}
                                        </div>
                                        <p className='text-[10px] font-medium text-slate-400 ml-5 mt-0.5'>{item.slotTime}</p>
                                    </div>

                                    {/* --- TYPE BADGE --- */}
                                    <div className='md:col-span-1'>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${isConsult ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                            {isConsult ? 'Video' : 'Visit'}
                                        </span>
                                    </div>

                                    {/* --- STATUS BADGE --- */}
                                    <div className='md:col-span-2 flex justify-start md:justify-end'>
                                        {item.isCompleted ? (
                                            <span className='text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100'>Completed</span>
                                        ) : item.cancelled ? (
                                            <span className='text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100'>Cancelled</span>
                                        ) : (
                                            <span className='text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100'>Pending</span>
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    }) : (
                        <div className='p-20 text-center text-blue-300 text-xs font-bold uppercase tracking-widest'>No records found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalDashboard;