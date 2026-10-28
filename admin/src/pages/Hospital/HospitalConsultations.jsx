import React, { useContext, useEffect, useState } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

/* --- CUSTOM BLUE & CYAN GRADIENT GENERATOR --- */
const getAvatarGradient = (name) => {
    if (!name) return 'from-blue-600 to-indigo-700';
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
        'from-blue-500 to-indigo-600',
        'from-cyan-500 to-blue-600',
        'from-sky-500 to-blue-700',
        'from-blue-600 to-cyan-600',
        'from-indigo-500 to-blue-600',
        'from-slate-600 to-blue-700'
    ];
    return gradients[charCodeSum % gradients.length];
};

const HospitalConsultations = () => {
    const { hToken, consultations, getHospitalConsultations } = useContext(HospitalContext);
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (hToken) {
            getHospitalConsultations();
        }
    }, [hToken]);

    const handleCopyId = (customId) => {
        navigator.clipboard.writeText(customId);
        toast.success(`Copied ID: ${customId}`);
    };

    /* --- FILTER LOGIC --- */
    const filteredConsultations = consultations?.filter((item, index) => {
        const patientName = item.patientId?.name?.toLowerCase() || "";
        const doctorName = item.doctorId?.name?.toLowerCase() || "";
        const customId = (item.consultationId || `CON-${(item._id ? item._id.slice(-6) : index + '773F').toUpperCase()}`).toLowerCase();
        
        const query = searchQuery.toLowerCase();

        return (
            patientName.includes(query) || 
            doctorName.includes(query) || 
            customId.includes(query)
        );
    }) || [];

    return (
        <div className='w-full max-w-6xl m-5 animate-fadeIn'>
            
            {/* --- Header & Search Bar Row --- */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5'>
                <div>
                    <p className='text-lg font-medium text-slate-700'>Hospital Video Consultations</p>
                    <p className='text-xs text-slate-400'>General overview and monitoring of doctor and patient consultation sessions.</p>
                </div>
                
                {/* Search Input Field */}
                <div className='relative w-full sm:w-72'>
                    <input 
                        type="text"
                        placeholder="Search patient, doctor, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full px-4 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 placeholder-slate-400 text-slate-700 transition-all shadow-xs'
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold'
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className='bg-white border border-slate-200/60 rounded-xl text-xs max-h-[80vh] min-h-[60vh] overflow-y-scroll shadow-md'>
                
                {/* --- Table Header --- */}
                <div className='hidden sm:grid grid-cols-[1.8fr_2.7fr_1fr_2.5fr_3fr_1.2fr_1.5fr] grid-flow-col py-3.5 px-6 border-b bg-slate-50 font-bold text-gray-600 uppercase tracking-wider'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Doctor Info</p>
                    <p>Fees</p>
                    <p className='text-center'>Actions</p>
                </div>

                {/* --- Consultations Mapping --- */}
                {filteredConsultations.length > 0 ? (
                    filteredConsultations.map((item, index) => {
                        const patient = item.patientId;
                        const doctor = item.doctorId;
                        
                        // ID Formatting (CON-1B773F)
                        const customId = item.consultationId || `CON-${(item._id ? item._id.slice(-6) : index + '773F').toUpperCase()}`;
                        const patientName = patient?.name || "";

                        return (
                            <div
                                key={item._id || index}
                                className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[1.8fr_2.7fr_1fr_2.5fr_3fr_1.2fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b border-slate-100 hover:bg-slate-50/50 transition-all'
                            >
                                {/* --- Consultation ID --- */}
                                <div 
                                    onClick={() => handleCopyId(customId)}
                                    className='font-mono text-[11px] font-bold bg-blue-50/60 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg cursor-pointer transition-all w-fit max-sm:w-full text-center border border-blue-100/50 shadow-xs'
                                    title="Click to copy"
                                >
                                    {customId} <span className='text-[9px] opacity-70'>📋</span>
                                </div>

                                {/* --- PATIENT: PROFILE --- */}
                                <div className='flex items-center gap-2'>
                                    {patient?.image && patient.image.length > 5 ? (
                                        <img 
                                            className='w-6 h-6 rounded-md bg-slate-100 object-cover border border-slate-200/60 shadow-xs' 
                                            src={patient.image} 
                                            alt="Patient" 
                                        />
                                    ) : (
                                        /* BLUE LUXURY AVATAR */
                                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getAvatarGradient(patientName)} flex items-center justify-center text-white font-bold text-[9px] uppercase tracking-tighter shadow-xs ring-1 ring-white/10`}>
                                            {patientName ? patientName.trim().charAt(0) : 'U'}
                                        </div>
                                    )}
                                    <p className='text-slate-900 font-semibold truncate max-w-[150px]'>{patientName || "Unknown Patient"}</p>
                                </div>

                                {/* Age */}
                                <p className='max-sm:hidden font-medium'>{patient?.dob ? calculateAge(patient.dob) : 'N/A'}</p>

                                {/* Date/Time */}
                                <p className='text-slate-600 font-medium'>
                                    {item.slotDate ? slotDateFormat(item.slotDate) : 'N/A'}<br/>
                                    <span className='text-[10px] text-slate-400'>{item.slotTime || ''}</span>
                                </p>
                                
                                {/* DOCTOR: PROFILE --- */}
                                <div className='flex items-center gap-2'>
                                    {doctor?.image && doctor.image.length > 5 ? (
                                        <img 
                                            className='w-6 h-6 rounded-md bg-blue-50/50 object-cover border border-blue-100/60 shadow-xs' 
                                            src={doctor.image} 
                                            alt="Doctor" 
                                        />
                                    ) : (
                                        /* BLUE LUXURY AVATAR FOR DOCTOR */
                                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getAvatarGradient(doctor?.name || '')} flex items-center justify-center text-white font-bold text-[9px] uppercase tracking-tighter shadow-xs`}>
                                            {doctor?.name ? doctor.name.trim().charAt(0) : 'D'}
                                        </div>
                                    )}
                                    <div className='flex flex-col'>
                                        <p className='text-slate-800 font-medium leading-none'>{doctor?.name || "Dr. Not Found"}</p>
                                        <span className='text-[9px] text-blue-600 font-bold uppercase mt-1'>{doctor?.speciality || 'General'}</span>
                                    </div>
                                </div>

                                {/* Fees */}
                                <p className='font-bold text-slate-700 font-mono'>{currency}{item.amount || 0}</p>
                                
                                {/* Actions / Status */}
                                <div className='flex justify-center items-center'>
                                    {item.cancelled ? (
                                        <span className='w-full text-center text-red-500 text-[10px] font-bold py-1 px-3 bg-red-50 rounded-full border border-red-100 uppercase tracking-wider'>
                                            Cancelled
                                        </span>
                                    ) : item.isCompleted ? (
                                        <span className='w-full text-center text-emerald-600 text-[10px] font-bold py-1 px-3 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-wider'>
                                            Completed
                                        </span>
                                    ) : (
                                        <span className='w-full text-center text-blue-600 text-[10px] font-bold py-1 px-3 bg-blue-50 rounded-full border border-blue-100 uppercase tracking-wider animate-pulse'>
                                        pending
                                        </span>
                                    )}
                                </div>

                            </div>
                        );
                    })
                ) : (
                    <div className='flex flex-col items-center justify-center py-32 text-gray-400'>
                        <span className='text-3xl mb-2'>📭</span>
                        <p className='text-sm font-medium text-slate-500'>
                            {searchQuery ? "No matching results found." : "No consultation records found."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalConsultations;