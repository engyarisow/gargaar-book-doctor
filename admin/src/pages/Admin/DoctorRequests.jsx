import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorRequests = () => {
  const { atoken, backendUrl } = useContext(AdminContext)
  const [requests, setRequests] = useState([])
  const [verificationModal, setVerificationModal] = useState({ isOpen: false, doctor: null })

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/pending-doctors', {
        headers: { Authorization: `Bearer ${atoken}` }
      })
      if (data.success) setRequests(data.doctors)
    } catch (error) {
      toast.error("Sync Error: Connection failed")
    }
  }

  const updateStatus = async (docId, status) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/admin/change-doctor-status',
        { docId, status },
        { headers: { Authorization: `Bearer ${atoken}` } }
      )
      if (data.success) {
        toast.success(`Doctor ${status === 'Approved' ? 'Verified' : 'Rejected'}`)
        setVerificationModal({ isOpen: false, doctor: null })
        fetchRequests()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => { if (atoken) fetchRequests() }, [atoken])

  return (
    <div className='p-8 bg-slate-50 min-h-screen font-sans relative overflow-hidden'>
      
      {/* 🟦 BACKGROUND DECOR (SOFT BLUE AURAS) */}
      <div className='absolute -top-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none'></div>
      <div className='absolute top-1/2 right-0 w-80 h-80 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none'></div>

      {/* --- FUTURISTIC HEADER --- */}
      <div className='relative z-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <div className='h-1 w-12 bg-blue-600 rounded-full'></div>
            <span className='text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]'>Gargaar</span>
          </div>
          <h1 className='text-4xl font-black text-slate-900 tracking-tight'>Verification Portal</h1>
        </div>
        
        {/* Statistics Glass Card */}
        <div className='bg-white/70 backdrop-blur-xl border border-white p-5 rounded-[28px] shadow-xl shadow-blue-900/5 flex items-center gap-6'>
          <div className='flex flex-col'>
            <span className='text-[10px] text-slate-400 font-bold uppercase'>Pending Node</span>
            <span className='text-2xl font-black text-blue-600'>{requests.length}</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200'>
             <div className='w-2 h-2 bg-white rounded-full animate-ping'></div>
          </div>
        </div>
      </div>

      {/* --- GRID LIST --- */}
      <div className='relative z-10 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8'>
        {requests.map((item) => (
          <div
            key={item._id}
            className='group bg-white rounded-[40px] border border-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(37,99,235,0.15)] transition-all duration-500 hover:-translate-y-2'
          >
            {/* Dynamic Badge: Hospital vs Clinic */}
            <div className='flex justify-between items-start mb-6'>
               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                 item.ownerType === 'hospital' 
                 ? 'bg-blue-50 text-blue-600 border-blue-100' 
                 : 'bg-cyan-50 text-cyan-600 border-cyan-100'
               }`}>
                 {item.ownerType === 'hospital' ? '🏥 Hospital Unit' : '⚕️ Clinic Node'}
               </div>
            </div>

            <div className='flex items-center gap-5 mb-8'>
              <div className='relative'>
                <img src={item.image} className='w-20 h-20 rounded-[30px] object-cover ring-4 ring-slate-50 shadow-lg' alt="" />
                <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                </div>
              </div>
              <div>
                <h2 className='text-xl font-black text-slate-900 leading-tight'>{item.name}</h2>
                <p className='text-blue-500 font-bold text-xs uppercase tracking-wider mt-1'>{item.speciality}</p>
              </div>
            </div>

            {/* Source Box */}
            <div className='bg-slate-50/80 rounded-3xl p-5 mb-8 border border-slate-100'>
              <div className='flex justify-between items-center mb-3'>
                <span className='text-[10px] text-slate-400 font-bold uppercase'>Origin Source</span>
                <span className='text-xs font-black text-slate-700'>{item.addedBy?.name}</span>
              </div>
              <div className='h-[1px] bg-white w-full mb-3'></div>
              <div className='flex justify-between items-center'>
                <span className='text-[10px] text-slate-400 font-bold uppercase'>Credentials</span>
                <span className='text-xs font-black text-blue-600'>{item.degree}</span>
              </div>
            </div>

            <button
              onClick={() => setVerificationModal({ isOpen: true, doctor: item })}
              className='w-full py-4 bg-slate-900 text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all active:scale-95'
            >
              Access Dossier
            </button>
          </div>
        ))}
      </div>

      {/* --- THE INFINITY BLUE MODAL --- */}
      {verificationModal.isOpen && (
        <div className='fixed inset-0 bg-blue-900/20 backdrop-blur-2xl z-50 flex items-center justify-center p-4' onClick={() => setVerificationModal({ isOpen: false, doctor: null })}>
          <div className='relative max-w-6xl w-full h-[85vh] bg-white rounded-[50px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row border border-white' onClick={e => e.stopPropagation()}>
            
            {/* 1. DOCUMENT SCANNER (LEFT) */}
            <div className='flex-1 bg-slate-50 p-10 flex flex-col'>
              <div className='flex justify-between items-center mb-6'>
                <span className='text-[10px] font-black text-blue-400 uppercase tracking-widest italic'>Identity Verification Protocol</span>
                <span className='bg-white px-3 py-1 rounded-lg text-[10px] font-mono shadow-sm'>ID: {verificationModal.doctor._id.slice(-6)}</span>
              </div>
              <div className='flex-1 bg-white rounded-[40px] border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden relative group'>
                {/* Visual Scan Line */}
                <div className='absolute top-0 left-0 w-full h-1 bg-blue-500/20 blur-sm animate-pulse'></div>
                {verificationModal.doctor.certificate ? (
                  <img src={verificationModal.doctor.certificate} className='max-w-[90%] max-h-[90%] object-contain' alt="Certificate" />
                ) : (
                  <div className='text-center opacity-20 text-blue-900'><p className='text-7xl mb-4'>📄</p><p className='font-black uppercase tracking-widest text-xs'>Missing Document</p></div>
                )}
              </div>
            </div>

            {/* 2. INFORMATION PANEL (RIGHT) */}
            <div className='w-full lg:w-[460px] bg-white p-12 flex flex-col justify-between border-l border-slate-50 relative overflow-y-auto'>
              <button onClick={() => setVerificationModal({ isOpen: false, doctor: null })} className='absolute top-8 right-10 text-slate-300 hover:text-blue-600 text-4xl transition-all'>×</button>

              <div className='flex flex-col gap-8'>
                <h3 className='text-3xl font-black text-slate-900 tracking-tight'>Verification Dossier</h3>
                
                {/* Specific Source Check (Hospital vs Clinic) */}
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                  verificationModal.doctor.ownerType === 'hospital' 
                  ? 'bg-blue-50 border-blue-100 text-blue-700' 
                  : 'bg-cyan-50 border-cyan-100 text-cyan-700'
                }`}>
                   <span className='text-xl'>{verificationModal.doctor.ownerType === 'hospital' ? '🏥' : '⚕️'}</span>
                   <p className='text-xs font-black uppercase tracking-wider'>
                     Verified request from <span className='underline'>{verificationModal.doctor.ownerType}</span>: {verificationModal.doctor.addedBy?.name}
                   </p>
                </div>

                {/* Profile Card */}
                <div className='flex items-center gap-5'>
                  <img src={verificationModal.doctor.image} className='w-24 h-24 rounded-[35px] object-cover shadow-2xl ring-4 ring-blue-50' alt="" />
                  <div>
                    <h4 className='text-2xl font-black text-slate-900 leading-none'>{verificationModal.doctor.name}</h4>
                    <p className='text-blue-600 font-bold text-sm mt-2 uppercase tracking-widest'>{verificationModal.doctor.speciality}</p>
                    <p className='text-slate-400 text-[10px] font-bold mt-1'>{verificationModal.doctor.email}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className='grid grid-cols-2 gap-4'>
                   {[
                     { label: 'Degree', value: verificationModal.doctor.degree },
                     { label: 'Experience', value: verificationModal.doctor.experience },
                     { label: 'Consultation', value: `$${verificationModal.doctor.fees}` },
                     { label: 'Network Node', value: verificationModal.doctor.addedBy?.name }
                   ].map((x, i) => (
                     <div key={i} className='bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm'>
                        <p className='text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest'>{x.label}</p>
                        <p className='font-bold text-slate-800 text-sm truncate'>{x.value}</p>
                     </div>
                   ))}
                </div>

                {/* Biography */}
                <div className='bg-blue-50/50 p-6 rounded-[30px] border border-blue-100/50'>
                  <p className='text-[10px] text-blue-400 font-black uppercase mb-2 tracking-widest'>Official Biography</p>
                  <p className='text-[13px] text-slate-600 leading-relaxed font-medium italic'>"{verificationModal.doctor.about}"</p>
                </div>

                {/* Address */}
                <div className='px-2'>
                  <p className='text-[10px] text-slate-400 font-black uppercase mb-2'>Base Location</p>
                  <p className='text-sm font-bold text-slate-700 flex items-center gap-2'>
                    <span className='text-blue-500'>📍</span>
                    {verificationModal.doctor.address?.line1}, {verificationModal.doctor.address?.line2}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className='flex flex-col gap-4 mt-12'>
                <button 
                  onClick={() => updateStatus(verificationModal.doctor._id, 'Approved')}
                  className='w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95'
                >
                  Approve 
                </button>
                <button 
                  onClick={() => updateStatus(verificationModal.doctor._id, 'Rejected')}
                  className='w-full py-4 bg-white text-red-500 font-bold border-2 border-red-50 rounded-[24px] hover:bg-red-50 transition-all'
                >
                    Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorRequests