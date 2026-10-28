import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {

    const { atoken, appointments, getAllAppointments } = useContext(AdminContext)
    const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
    
    // State-ka loogu talagalay Search Box-ka
    const [searchQuery, setSearchQuery] = useState('')
    
    // State-ka loogu talagalay Copy function-ka (Wuxuu xafidayaa ID-ga la copy-gareeyay)
    const [copiedId, setCopiedId] = useState(null)

    useEffect(() => {
        if (atoken) {
            getAllAppointments()
        }
    }, [atoken])

    // Function-ka samaynaya Copy-ga
    const handleCopy = (idText) => {
        navigator.clipboard.writeText(idText);
        setCopiedId(idText);
        // Saxda cagaaran waxay baaba'aysaa 2 ilbiriqsi kadib
        setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    }

    // Filter-ka raadinta (Search Logic) isagoo soo hor-marinaya kuwa ugu cusub (reverse)
    const filteredAppointments = appointments?.slice().reverse().filter(item => {
        const searchTerm = searchQuery.toLowerCase();
        // Waxaan la jaanqaadsiinay qaabka cusub ee App ID-ga raadintiisa
        const formattedAppId = `app-${item._id ? item._id.slice(-6).toLowerCase() : ''}`;
        const patientName = item.userData?.name?.toLowerCase() || '';
        const doctorName = item.docData?.name?.toLowerCase() || '';
        
        return formattedAppId.includes(searchTerm) || 
               item._id?.toLowerCase().includes(searchTerm) || // In case ay ID-ga caadiga ah qoraan
               patientName.includes(searchTerm) || 
               doctorName.includes(searchTerm);
    }) || [];

    return (
        <div className='w-full max-w-6xl m-5'>
            
            {/* Header section with Title and Search Box */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3'>
                <p className='text-base font-semibold text-slate-700'>All Appointments</p>
                
                {/* Search Box */}
                <div className='relative w-full sm:w-72'>
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search ID, Patient, or Doctor..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all'
                    />
                </div>
            </div>

            <div className='bg-white border rounded-lg text-xs max-h-[80vh] min-h-[50vh] overflow-y-scroll shadow-sm'>

                {/* --- Table Header (Compact) --- */}
                {/* Column-ka hore waxaan u kordhinay 1fr si App ID iyo Copy Icon u wada qaado */}
                <div className='hidden sm:grid grid-cols-[1fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-2 px-4 border-b bg-slate-50 font-bold text-slate-500 uppercase tracking-wider'>
                    <p>App ID</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Doctor</p>
                    <p>Fees</p>
                    <p className='text-center'>Status</p>
                </div>

                {/* --- Data Mapping --- */}
                {filteredAppointments.length > 0 ? filteredAppointments.map((item, index) => {
                    // Diyaarinta App ID-ga rasmiga ah
                    const displayAppId = `APP-${item._id.slice(-6).toUpperCase()}`;

                    return (
                        <div
                            key={index}
                            className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[1fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-slate-600 py-2 px-4 border-b hover:bg-slate-50 transition-all'
                        >
                            {/* App ID iyo Copy Button */}
                            <div className='max-sm:hidden flex items-center gap-1.5'>
                                <p className='text-blue-700 font-mono font-bold tracking-wide text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100'>
                                    {displayAppId}
                                </p>
                                <button 
                                    onClick={() => handleCopy(displayAppId)} 
                                    title="Copy App ID"
                                    className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                                >
                                    {copiedId === displayAppId ? (
                                        // Sax cagaaran (Copied Icon)
                                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        // Copy Icon Caadi ah
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Patient Profile - SMALL */}
                            <div className='flex items-center gap-2'>
                                <img 
                                    className='w-8 h-8 min-w-[32px] rounded-full bg-slate-100 object-cover border border-slate-200' 
                                    src={item.userData.image || assets.profile_pic} 
                                    alt="" 
                                />
                                <p className='text-slate-900 font-medium'>{item.userData.name}</p>
                            </div>

                            {/* Age */}
                            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
                            
                            {/* Schedule */}
                            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                            
                            {/* Doctor Profile - SMALL */}
                            <div className='flex items-center gap-2'>
                                <img 
                                    className='w-8 h-8 min-w-[32px] rounded-full bg-blue-50 object-cover border border-slate-100' 
                                    src={item.docData.image || assets.profile_pic} 
                                    alt="" 
                                />
                                <p className='text-slate-700'>{item.docData.name}</p>
                            </div>

                            {/* Fees */}
                            <p className='font-bold text-slate-800'>{currency}{item.amount}</p>
                            
                            {/* Status Area */}
                            <div className='flex justify-center items-center'>
                                {item.cancelled ? (
                                    <p className='text-red-400 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px] border border-red-100'>Cancelled</p>
                                ) : item.isCompleted ? (
                                    <p className='text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-100'>Completed</p>
                                ) : (
                                    <p className='text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100'>Pending</p>
                                )}
                            </div>
                        </div>
                    )
                }) : (
                    <div className='p-10 text-center text-slate-400'>
                        No appointments found matching your search.
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllAppointments