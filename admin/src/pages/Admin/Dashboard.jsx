import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { Copy, CheckCircle } from 'lucide-react' 

const Dashboard = () => {
  // Waxaan halkan ka saarnay cancelAppointment iyo completeAppointment maadaama Admin uusan badali karin
  const { atoken, getDashData, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  // State-ka lagu xakameynayo Copy ID
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (atoken) {
      getDashData()
    }
  }, [atoken])

  // Function-ka koobi gareynaya ID-ga
  const handleCopyId = (id, type) => {
    const cleanId = id.slice(-6).toUpperCase();
    const prefix = type === 'Appointment' ? 'APPT-' : 'CON-';
    navigator.clipboard.writeText(`${prefix}${cleanId}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"

  // Function-ka midabeeya Status-yada
  const getStatusColor = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  }

  // Kala shaandhaynta Bookings-ka (Week-ga kaliya & Ugu dambeeya sare)
  const processedBookings = (dashData?.latestBookings || [])
    .filter((item) => {
      let itemTime = 0;
      if (item.date) {
        itemTime = Number(item.date);
      } else if (item.slotDate) {
        const parts = item.slotDate.split('_');
        if (parts.length === 3) {
          itemTime = new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        } else {
          itemTime = new Date(item.slotDate).getTime();
        }
      }
      if (!itemTime) return true;
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      return (Date.now() - itemTime) <= oneWeekInMs;
    })
    .sort((a, b) => {
      let timeA = a.date ? Number(a.date) : 0;
      let timeB = b.date ? Number(b.date) : 0;
      
      if (!timeA && a.slotDate) {
        const pA = a.slotDate.split('_');
        timeA = pA.length === 3 ? new Date(pA[2], pA[1] - 1, pA[0]).getTime() : new Date(a.slotDate).getTime();
      }
      if (!timeB && b.slotDate) {
        const pB = b.slotDate.split('_');
        timeB = pB.length === 3 ? new Date(pB[2], pB[1] - 1, pB[0]).getTime() : new Date(b.slotDate).getTime();
      }
      return timeB - timeA;
    });

  // XISAABINTA: Kaliya kuwa "Completed" ah
  const totalCompletedAppointments = dashData?.totalCompletedAppts ?? (dashData?.latestBookings || []).filter(
    (item) => item.bookingType === 'Appointment' && (item.isCompleted || item.status?.toLowerCase() === 'completed')
  ).length;

  const totalCompletedConsultations = dashData?.totalCompletedCons ?? (dashData?.latestBookings || []).filter(
    (item) => item.bookingType !== 'Appointment' && (item.isCompleted || item.status?.toLowerCase() === 'completed')
  ).length;

  return dashData && (
    <div className='m-4 sm:m-6 space-y-6 bg-gray-50 min-h-screen p-1 text-gray-800 antialiased'>

      {/* --- QAYBTA SARE: BLUE MASTERCARD & STATS CARDS --- */}
      <div className='flex flex-col lg:flex-row gap-5 items-start'>

        {/* MODERN BLUE MASTERCARD */}
        <div className='relative w-full sm:w-72 h-44 bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-900 text-white p-4 rounded-2xl shadow-xl flex flex-col justify-between shrink-0 transform hover:rotate-1 hover:scale-103 transition-all duration-300 border border-blue-500/20 overflow-hidden'>
          <div className='absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none'></div>
          <div className='absolute left-1/3 top-0 w-20 h-20 bg-indigo-400/10 rounded-full blur-md pointer-events-none'></div>
          
          <div className='flex justify-between items-start z-10'>
            <div>
              <p className='text-[9px] text-blue-200 font-semibold tracking-widest uppercase'>Total Revenue</p>
              <p className='text-2xl font-bold tracking-tight mt-0.5'>${(dashData.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className='w-8 h-6 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded flex flex-col justify-between p-[2px] shadow-inner opacity-90'>
              <div className='w-full h-[1.5px] bg-amber-800/20'></div>
              <div className='w-full h-[1.5px] bg-amber-800/20'></div>
              <div className='w-full h-[1.5px] bg-amber-800/20'></div>
            </div>
          </div>

          {/* Halkan ayaa lagu dhaafay lacagta Orders-ka (Mastercard dhexdiisa) */}
          <div className='z-10 flex justify-between items-center bg-black/10 py-1.5 px-3 rounded-lg backdrop-blur-sm border border-white/5'>
            <div>
              <p className='text-[8px] text-blue-200 uppercase font-medium'>Appts</p>
              <p className='text-xs font-semibold text-emerald-400'>${dashData.apptRevenue || 0}</p>
            </div>
            <div className='w-[1px] h-5 bg-white/20'></div>
            <div className='text-center'>
              <p className='text-[8px] text-blue-200 uppercase font-medium'>Orders</p>
              <p className='text-xs font-semibold text-orange-400'>${dashData.ordersRevenue || 0}</p>
            </div>
            <div className='w-[1px] h-5 bg-white/20'></div>
            <div className='text-right'>
              <p className='text-[8px] text-blue-200 uppercase font-medium'>Consults</p>
              <p className='text-xs font-semibold text-cyan-400'>${dashData.consRevenue || 0}</p>
            </div>
          </div>

          <div className='flex justify-between items-end z-10'>
            <div>
              <p className='text-[8px] text-blue-300 tracking-wider uppercase'>Card Holder</p>
              <p className='text-[10px] font-medium tracking-wide text-white/90'>GARGAAR ADMIN</p>
            </div>
            <div className='flex items-center -space-x-2.5 opacity-90'>
              <div className='w-5 h-5 bg-red-500 rounded-full mix-blend-screen'></div>
              <div className='w-5 h-5 bg-amber-500 rounded-full mix-blend-screen'></div>
            </div>
          </div>
        </div>

        {/* 7 STATS CARDS (Grid updated to 4 columns on large screens) */}
        <div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 w-full'>
          
          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-blue-50 text-blue-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{dashData.doctors || 0}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Doctors</p>
            </div>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{dashData.patients || 0}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Patients</p>
            </div>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-amber-50 text-amber-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{dashData.hospitals || 0}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Hospitals</p>
            </div>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-purple-50 text-purple-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5M6 21v-10.5a2.25 2.25 0 0 1 2.25-2.25h10.5A2.25 2.25 0 0 1 21 10.5V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{dashData.pharmacies || 0}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Pharmacies</p>
            </div>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{totalCompletedAppointments}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Done Appts</p>
            </div>
          </div>

          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-cyan-50 text-cyan-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655 9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M8.457 8.457L3 3m5.457 5.457 7.086 7.086m0 0L21 21" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{totalCompletedConsultations}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Done Consults</p>
            </div>
          </div>

          {/* TOTAL ORDERS BOX */}
          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200'>
            <div className='p-2 bg-orange-50 text-orange-600 rounded-lg w-fit'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
            </div>
            <div className='mt-3'>
              <p className='text-xl font-bold text-gray-900 tracking-tight'>{dashData.totalOrders || 0}</p>
              <p className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5'>Total Orders</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- QAYBTA HOOSE: SMALL SIZE MODERN TABLE --- */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        
        <div className='flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='p-1.5 bg-blue-50 text-blue-600 rounded-md'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
            </div>
            <p className='font-bold text-gray-800 text-[15px] tracking-tight'>Latest Bookings</p>
          </div>
          <span className='bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full'>This Week</span>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-[12px] text-left border-collapse'>
            <thead className='text-[10px] text-gray-400 font-bold uppercase bg-gray-50/70 border-b border-gray-100'>
              <tr>
                <th className='px-4 py-2.5 whitespace-nowrap'># ID</th>
                <th className='px-4 py-2.5'>Type</th>
                <th className='px-4 py-2.5'>Patient</th>
                <th className='px-4 py-2.5'>Doctor</th>
                <th className='px-4 py-2.5'>Date & Time</th>
                <th className='px-4 py-2.5 text-center'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {processedBookings.map((item, index) => {
                
                const isAppt = item.bookingType === 'Appointment';
                const prefix = isAppt ? 'APPT-' : 'CON-';
                const shortId = item._id.slice(-6).toUpperCase();

                let displayStatus = 'Pending';
                if (item.cancelled || item.status?.toLowerCase() === 'cancelled') {
                  displayStatus = 'Cancelled';
                } else if (item.isCompleted || item.status?.toLowerCase() === 'completed') {
                  displayStatus = 'Completed';
                }

                return (
                  <tr key={index} className='hover:bg-gray-50/80 transition-all duration-150 group'>
                    
                    <td className='px-4 py-2.5'>
                      <button 
                        onClick={() => handleCopyId(item._id, item.bookingType)}
                        className={`group/id inline-flex items-center gap-1 font-mono text-[10px] font-semibold border px-1.5 py-0.5 rounded transition-all active:scale-95 ${
                          copiedId === item._id 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        title="Copy ID"
                      >
                        <span>{prefix}{shortId}</span>
                        {copiedId === item._id ? <CheckCircle size={10} /> : <Copy size={10} />}
                      </button>
                    </td>

                    <td className='px-4 py-2.5'>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        isAppt 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        {item.bookingType}
                      </span>
                    </td>

                    <td className='px-4 py-2.5'>
                      <div className='flex items-center gap-2 whitespace-nowrap'>
                        <img 
                          className='w-7 h-7 rounded-full object-cover border border-gray-100 shadow-sm' 
                          src={item.userData?.image || defaultAvatar} 
                          alt="Patient" 
                          onError={(e) => { e.target.src = defaultAvatar }}
                        />
                        <div>
                          <p className='font-semibold text-gray-800 text-[12px] leading-tight'>{item.userData?.name || 'Unknown Patient'}</p>
                          <p className='text-[10px] text-gray-400 mt-[1px]'>{item.userData?.phone || 'No Contact'}</p>
                        </div>
                      </div>
                    </td>

                    <td className='px-4 py-2.5 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <img className='w-6 h-6 rounded-full object-cover ring-1 ring-gray-100' src={item.docData?.image} alt="" />
                        <p className='font-medium text-gray-700 text-[12px]'>Dr. {item.docData?.name}</p>
                      </div>
                    </td>

                    <td className='px-4 py-2.5 whitespace-nowrap'>
                      <p className='font-medium text-gray-700 text-[12px]'>{slotDateFormat(item.slotDate)}</p>
                      <p className='text-[10px] text-gray-400 font-medium mt-[1px]'>{item.slotTime}</p>
                    </td>

                    <td className='px-4 py-2.5 text-center'>
                      {/* Halkan Admin wuxuu arki karaa oo kaliya xaalada - ma bedeli karo */}
                      <div className='flex items-center justify-center'>
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(displayStatus)}`}>
                           {displayStatus}
                         </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {processedBookings.length === 0 && (
            <div className='text-center py-8 text-gray-400 font-medium text-xs'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto opacity-30 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18a2.25 2.25 0 0 1 2.25 2.25v4.5A2.25 2.25 0 0 1 21 21H3a2.25 2.25 0 0 1-2.25-2.25v-4.5A2.25 2.25 0 0 1 2.25 13.5Z" /></svg>
              No bookings registered this week.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard