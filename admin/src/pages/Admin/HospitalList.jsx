import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify' // Toast waan ku darnay si fariin usoo saaro

const HospitalList = () => {
  // Soo saar xogta iyo function-ka block-ga ee Context-ka
  const { hospitals, getAllHospitals, atoken, blockHospital } = useContext(AdminContext)

  // Marka bogga la furo ama token-ku isbeddelo, soo qaad xogta cusub
  useEffect(() => {
    if (atoken) {
      getAllHospitals()
    }
  }, [atoken])

  // Function-ka Copy-ga sameynaya
  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id)
    toast.success("Hospital ID copied!")
  }

  return (
    <div className='m-5 h-[90vh] overflow-y-auto no-scrollbar'>

      {/* Header Section */}
      <h1 className='text-2xl font-semibold text-gray-800 mb-6'>
        All Hospitals 
      </h1>

      {/* Grid Layout */}
      <div className='grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6'>
        
        {hospitals && hospitals.length > 0 ? (
          hospitals.map((item, index) => (
            <div
              key={item._id || index}
              className='bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group relative'
            >
              
              {/* 🔴 BLOCKED BADGE: Kaliya haddii item.blocked uu true yahay */}
              {item.blocked && (
                <span className='absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider'>
                  Blocked
                </span>
              )}

              {/* Logo/Image Section */}
              <div className='relative bg-gray-50 h-48 flex items-center justify-center'>
                <img
                  className={`w-32 h-32 object-contain p-2 group-hover:scale-110 transition-all duration-500 
                    ${item.blocked ? 'grayscale opacity-40 italic' : ''}`}
                  src={item.logo}
                  alt={item.name}
                />

                {/* Status Indicator (Approved/Pending) */}
                <span
                  className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter
                  ${item.status === 'approved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {item.status || 'Pending'}
                </span>
              </div>

              {/* Information Content Section */}
              <div className='p-4'>

                {/* HOSPITAL ID W/ COPY BUTTON */}
                <div 
                  onClick={() => copyToClipboard(item._id)}
                  title="Click to copy full ID"
                  className='inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded cursor-pointer transition-colors mb-1.5'
                >
                  <p className='text-[10px] font-mono font-bold text-gray-500 uppercase'>
                    hos:{item._id.slice(-4)}
                  </p>
                  {/* Copy Icon yar */}
                  <svg className="w-3 h-3 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>

                <p className='text-lg font-semibold text-gray-900 truncate' title={item.name}>
                  {item.name || "Unnamed Hospital"}
                </p>

                <p className='text-sm text-indigo-500 font-medium mt-1 truncate'>
                  📍 {item.location || "Location not set"}
                </p>

                {/* Details Row: Category & Date */}
                <div className='mt-3 flex items-center justify-between text-xs border-y border-gray-50 py-3'>
                  <div>
                    <p className='text-gray-400'>speciality</p>
                    <p className='font-bold text-gray-700'>
                      {Array.isArray(item.speciality) && item.speciality.length > 0 
                        ? item.speciality[0] 
                        : 'General'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-gray-400'>since</p>
                    <p className='font-bold text-indigo-600'>
                      {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* 🚫 ACTION BUTTON: Toggle Block/Unblock */}
                <button
                  onClick={() => blockHospital(item._id)}
                  className={`mt-4 w-full py-2 rounded-lg text-sm font-bold transition-all duration-300
                    ${item.blocked
                      ? "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white shadow-sm" 
                      : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100"
                    }`}
                >
                  {item.blocked ? "Unblock Hospital" : "Block Hospital"}
                </button>

              </div>
            </div>
          ))
        ) : (
          /* Empty/Loading State */
          <div className='col-span-full flex flex-col items-center justify-center h-[50vh] text-gray-400'>
             <div className='animate-pulse mb-2 text-4xl'>🏥</div>
             <p className='text-lg font-medium'>Wali ma jiraan cisbitaallo la soo bandhigo.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalList