import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify' // Toast waan ku darnay si fariin usoo saaro

const DoctorsList = () => {

  const { doctors, atoken, getAllDoctors, changeAvailability, blockDoctor } = useContext(AdminContext)

  useEffect(() => {
    if (atoken) {
      getAllDoctors()
    }
  }, [atoken])

  // Function-ka Copy-ga sameynaya
  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id)
    toast.success("Doctor ID copied!")
  }

  return (
    <div className='m-4 h-[90vh] overflow-y-auto no-scrollbar'>

      {/* --- Header Section --- */}
      <div className='flex items-center justify-between mb-4 px-2'>
        <div>
          <h1 className='text-lg font-bold text-gray-800'>Doctors Management</h1>
          <p className='text-[10px] text-gray-500'>Full control over providers</p>
        </div>
        <span className='bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-100'>
          {doctors.length} Total
        </span>
      </div>

      {/* --- Grid Layout (Small & Compact) --- */}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'>

        {doctors.map((item, index) => (
          <div
            key={index}
            className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group relative'
          >

            {/* 1. BLOCKED OVERLAY */}
            {item.blocked && (
              <div className='absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center'>
                <span className='bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg'>
                  BLOCKED
                </span>
              </div>
            )}

            {/* Image Section */}
            <div className='relative h-40 bg-gray-50 overflow-hidden'>
              <img
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${item.blocked ? 'grayscale' : ''}`}
                src={item.image}
                alt={item.name}
              />
              
              <div className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-md 
                ${item.available ? "bg-green-100/90 text-green-700" : "bg-red-100/90 text-red-700"}`}>
                {item.available ? "ONLINE" : "OFFLINE"}
              </div>
            </div>

            {/* Content Section */}
            <div className='p-3'>

              {/* Name & Speciality */}
              <div className='mb-2'>
                
                {/* DOCTOR ID W/ COPY BUTTON */}
                <div 
                  onClick={() => copyToClipboard(item._id)}
                  title="Click to copy full ID"
                  className='inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded cursor-pointer transition-colors mb-1.5'
                >
                  <p className='text-[10px] font-mono font-bold text-gray-500 uppercase'>
                    doc:{item._id.slice(-4)}
                  </p>
                  {/* Copy Icon yar */}
                  <svg className="w-3 h-3 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>

                <p className='text-[14px] font-bold text-gray-900 truncate'>{item.name}</p>
                <p className='text-[10px] text-indigo-500 font-bold uppercase truncate'>{item.speciality}</p>
                
                {/* 🏥 Clinic/Hospital Info */}
                <div className='mt-1'>
                  {item.ownerType === 'hospital' ? (
                    <p className='text-[9px] font-semibold text-blue-600 truncate'>
                      🏥 Hospital: <span className='text-gray-500'>{item.addedBy?.name || 'N/A'}</span>
                    </p>
                  ) : item.ownerType === 'clinic' ? (
                    <p className='text-[9px] font-semibold text-emerald-600 truncate'>
                      ⚕️ Clinic: <span className='text-gray-500'>{item.addedBy?.name || 'N/A'}</span>
                    </p>
                  ) : (
                    <p className='text-[9px] font-semibold text-amber-600'>
                      👤 Freelancer
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className='flex items-center justify-between py-1.5 border-y border-gray-50 mb-3'>
                <div className='text-center'>
                  <p className='text-[7px] text-gray-400 font-bold uppercase'>Exp</p>
                  <p className='text-[9px] font-bold text-gray-700'>{item.experience}</p>
                </div>
                <div className='text-center'>
                  <p className='text-[7px] text-gray-400 font-bold uppercase'>Fee</p>
                  <p className='text-[9px] font-bold text-indigo-600'>${item.fees}</p>
                </div>
                <div className='text-center'>
                  <p className='text-[7px] text-gray-400 font-bold uppercase'>Status</p>
                  <p className={`text-[8px] font-bold ${item.status === 'Approved' ? 'text-green-500' : 'text-amber-500'}`}>
                    {item.status}
                  </p>
                </div>
              </div>

              {/* Actions Section */}
              <div className='space-y-2'>
                
                {/* Availability Toggle */}
                <div className='flex items-center justify-between'>
                  <span className='text-[10px] text-gray-600 font-medium'>Available</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.available || false}
                      onChange={() => changeAvailability(item._id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>

                {/* 🟢 BLOCK/UNBLOCK BUTTON (Fully Clickable) */}
                <button
                  onClick={() => blockDoctor(item._id)}
                  className={`relative z-50 w-full py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all
                    ${item.blocked
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                      : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                >
                  {item.blocked ? "Unblock Access" : "Block Doctor"}
                </button>
              </div>

            </div>

          </div>
        ))}

      </div>
    </div>
  )
}

export default DoctorsList