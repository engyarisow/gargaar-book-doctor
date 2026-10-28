import React, { useContext, useEffect } from 'react'
import { HospitalContext } from '../../context/HospitalContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorsList = () => {
    // Ka soo qaad macluumaadka lagama maarmaanka ah HospitalContext
    const { doctors, getDoctors, hToken, backendUrl } = useContext(HospitalContext)

    // Function lagu beddelayo haddii dhakhtarku joogo (Availability)
    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital/change-availability', { docId }, {
                headers: { htoken: hToken }
            })
            if (data.success) {
                toast.success(data.message)
                getDoctors() // Si xogta loo soo cusboonaysiiyo (Refresh)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if (hToken) {
            getDoctors()
        }
    }, [hToken])

    return (
        <div className='m-5 h-[90vh] overflow-y-auto no-scrollbar'>
            
            {/* Header Section - Similar to Clinic */}
            <div className='flex flex-col mb-6'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold text-slate-800'>Hospital Doctors</h1>
                    <p className='text-sm text-blue-500 bg-blue-50 px-4 py-1 rounded-full font-medium'>
                        Total: {doctors?.length || 0} Doctors
                    </p>
                </div>
                <p className='text-slate-500 text-sm mt-1'>Manage and monitor your hospital's registered medical professionals.</p>
            </div>

            {/* Grid Layout - Responsive & Matches Clinic Design */}
            <div className='grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6'>
                
                {doctors && doctors.map((item, index) => (
                    <div 
                        key={index} 
                        className='bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group relative'
                    >
                        
                        {/* 🟢 Status Badge (Pending/Approved) */}
                        <span className={`absolute top-3 right-3 z-10 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm
                            ${item.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {item.status}
                        </span>

                        {/* Image Container with Zoom effect */}
                        <div className='relative overflow-hidden bg-slate-100'>
                            <img 
                                className='w-full h-52 object-cover group-hover:scale-110 transition-all duration-500' 
                                src={item.image} 
                                alt={item.name} 
                            />
                            
                            {/* Availability Overlay Badge */}
                            <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-md
                                ${item.available ? 'bg-green-100/90 text-green-700' : 'bg-red-100/90 text-red-700'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                {item.available ? 'Active Now' : 'Off Duty'}
                            </div>
                        </div>

                        {/* Doctor Content Section */}
                        <div className='p-5'>
                            
                            {/* Name & Speciality */}
                            <div className='mb-4'>
                                <p className='text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors'>
                                    {item.name}
                                </p>
                                <p className='text-blue-500 text-xs font-semibold uppercase tracking-widest mt-1'>
                                    {item.speciality}
                                </p>
                            </div>

                            {/* Stats Comparison: Experience & Fees */}
                            <div className='flex items-center justify-between py-3 border-y border-slate-50 mb-4'>
                                <div className='text-center'>
                                    <p className='text-[10px] text-slate-400 uppercase font-bold tracking-tighter'>Experience</p>
                                    <p className='text-sm font-bold text-slate-700'>{item.experience}</p>
                                </div>
                                <div className='w-[1px] h-6 bg-slate-100'></div>
                                <div className='text-center'>
                                    <p className='text-[10px] text-slate-400 uppercase font-bold tracking-tighter'>Fees</p>
                                    <p className='text-sm font-bold text-blue-600'>${item.fees}</p>
                                </div>
                            </div>

                            {/* Availability Toggle Switch - Modern UI */}
                            <div className='flex items-center justify-between bg-slate-50 p-3 rounded-xl'>
                                <span className='text-xs font-bold text-slate-600'>Available for Booking</span>
                                
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={item.available} 
                                        onChange={() => changeAvailability(item._id)} 
                                    />
                                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                </label>
                            </div>

                        </div>
                    </div>
                ))}

            </div>

            {/* Empty State - If no doctors found */}
            {(!doctors || doctors.length === 0) && (
                <div className='flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-200 mt-10'>
                    <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
                         <p className='text-2xl'>👨‍⚕️</p>
                    </div>
                    <p className='text-slate-400 font-medium'>No doctors registered under this hospital.</p>
                </div>
            )}
        </div>
    )
}

export default DoctorsList