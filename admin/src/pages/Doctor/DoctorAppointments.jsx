import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from '../../assets/assets';
import { Search, Copy, CheckCircle, Calendar, ShieldCheck, KeyRound, Loader2 } from 'lucide-react'; 
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointments, cancelAppointments, backendUrl } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  const [pinInputs, setPinInputs] = useState({});
  const [loadingPinId, setLoadingPinId] = useState(null);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  const getAvatarGradient = (name) => {
    if (!name) return 'from-slate-400 to-slate-500';
    const gradients = [
        'from-sky-400 to-indigo-500',
        'from-emerald-400 to-teal-600',
        'from-violet-400 to-purple-600',
        'from-rose-400 to-pink-600',
        'from-amber-400 to-orange-500',
        'from-cyan-400 to-blue-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const handleCopyId = (id) => {
    const cleanId = `APP-${id.slice(-6).toUpperCase()}`;
    navigator.clipboard.writeText(cleanId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleVerifyMeetingPin = async (appointmentId) => {
    const pin = pinInputs[appointmentId];
    
    if (!pin || pin.trim().length < 4) {
      return toast.error("Fadlan geli Code-ka oo dhammaystiran (4 God).");
    }

    try {
      setLoadingPinId(appointmentId);
      
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/verify-pin`, 
        { appointmentId, pin: pin.trim() }, 
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setPinInputs(prev => ({ ...prev, [appointmentId]: '' }));
        
        await getAppointments();
        completeAppointments(appointmentId);
        
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingPinId(null);
    }
  };

  const handlePinInputChange = (id, val) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 4);
    setPinInputs(prev => ({ ...prev, [id]: cleanVal }));
  };

  const filteredAppointments = appointments ? [...appointments].reverse().filter((item) => {
    const name = (item.userData?.name || '').toLowerCase();
    const shortId = `APP-${item._id?.slice(-6).toUpperCase()}`.toLowerCase();
    const rawId = item._id?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || shortId.includes(search) || rawId.includes(search);
  }) : [];

  return (
    <div className="w-full max-w-5xl p-2 sm:p-4 font-sans antialiased text-[11px]">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">Appointments Hub</h1>
          <p className="text-[10px] text-slate-400 hidden sm:block">Manage and verify patient visits</p>
        </div>
        
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input 
            type="text" 
            placeholder="Search patient or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all duration-150"
          />
        </div>
      </div>
      
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
        
        <div className="hidden lg:grid grid-cols-[0.3fr_1fr_1.6fr_0.7fr_0.5fr_1.8fr_0.6fr_1.7fr_0.8fr] gap-2 py-2 px-3.5 border-b border-slate-100 bg-slate-50/60 font-bold text-slate-400 select-none text-[10px] uppercase tracking-wider">
          <p>#</p>
          <p>ID</p>
          <p>Patient</p>
          <p>Method</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p className="text-center">Xaqiijinta Kulanka (PIN)</p>
          <p className="text-center">Action</p>
        </div>

        <div className="divide-y divide-slate-50 max-h-[65vh] overflow-y-auto">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((item, index) => {
              const shortId = `APP-${item._id?.slice(-6).toUpperCase()}`;
              const patientName = item.userData?.name || '';
              const patientImage = item.userData?.image;

              return (
                <div
                  key={item._id}
                  className="flex flex-col lg:grid lg:grid-cols-[0.3fr_1fr_1.6fr_0.7fr_0.5fr_1.8fr_0.6fr_1.7fr_0.8fr] gap-2 items-start lg:items-center p-3 hover:bg-slate-50/30 transition-all text-slate-500"
                >
                  <p className="hidden lg:block text-slate-300 font-medium">{appointments.length - index}</p>

                  <div className="flex items-center justify-between w-full lg:w-auto">
                    <button 
                      onClick={() => handleCopyId(item._id)}
                      className={`group/id inline-flex items-center gap-1 font-mono text-[9px] border px-1.5 py-0.5 rounded transition-all active:scale-95 ${
                        copiedId === item._id 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <span>{shortId}</span>
                      {copiedId === item._id ? <CheckCircle size={8} /> : <Copy size={8} />}
                    </button>
                    
                    <div className="flex items-center gap-1.5 lg:hidden">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        item.payment ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.payment ? 'Online' : 'Cash'}
                      </span>
                      <span className="font-bold text-slate-700">{currency}{item.amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {patientImage && patientImage.length > 5 ? (
                      <img className="w-7 h-7 rounded-lg bg-slate-50 border object-cover" src={patientImage} alt="" />
                    ) : (
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarGradient(patientName)} flex items-center justify-center text-white font-bold text-[10px] uppercase border border-white shadow-2xs`}>
                        {patientName ? patientName.trim().charAt(0) : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 truncate max-w-[130px] text-xs tracking-tight">{patientName || "Anonymous"}</p>
                      <p className="text-[9px] text-slate-400 lg:hidden">Age: {calculateAge(item.userData?.dob)}y</p>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <span className={`text-[9px] font-semibold border px-1.5 py-0.2 rounded ${
                      item.payment ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {item.payment ? 'Online' : 'Cash'}
                    </span>
                  </div>

                  <p className="hidden lg:block font-medium text-slate-600">{calculateAge(item.userData?.dob)}y</p>
                  
                  <div className="flex items-center gap-1 text-slate-600 max-lg:bg-slate-50 max-lg:w-full max-lg:p-1.5 max-lg:rounded-lg max-lg:border max-lg:border-slate-100">
                    <Calendar size={11} className="text-blue-500 shrink-0" />
                    <span>{slotDateFormat(item.slotDate)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold text-blue-600">{item.slotTime}</span>
                  </div>

                  <p className="hidden lg:block font-bold text-slate-700">{currency}{item.amount}</p>

                  {/* PIN Verification Section */}
                  <div className="w-full lg:w-auto flex items-center justify-center py-1 lg:py-0">
                    {item.cancelled ? (
                      <span className="text-slate-300 text-[9px] font-medium italic">N/A (Cancelled)</span>
                    ) : item.isCompleted ? (
                      <div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-3xs">
                        <ShieldCheck size={11} />
                        <span>Done & Verified</span>
                      </div>
                    ) : item.isPinVerified ? (
                      <div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-3xs">
                        <ShieldCheck size={11} />
                        <span>PIN Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-lg p-1 w-full lg:w-auto justify-between lg:justify-start">
                        <div className="flex items-center gap-1">
                          <KeyRound size={10} className="text-slate-400 ml-0.5 hidden sm:block" />
                          <input 
                            type="text" 
                            placeholder="Code"
                            value={pinInputs[item._id] || ''}
                            onChange={(e) => handlePinInputChange(item._id, e.target.value)}
                            disabled={loadingPinId === item._id}
                            className="w-14 text-center font-mono text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-800 font-bold tracking-wider placeholder:font-sans placeholder:text-[9px] placeholder:tracking-normal focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => handleVerifyMeetingPin(item._id)}
                          disabled={loadingPinId === item._id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] px-2 py-0.5 rounded transition-all active:scale-95 disabled:bg-slate-300 flex items-center justify-center min-w-[44px]"
                        >
                          {loadingPinId === item._id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="flex justify-end lg:justify-center items-center w-full lg:w-auto pt-1 lg:pt-0 max-lg:border-t max-lg:border-slate-50">
                    {item.cancelled ? (
                      <span className="text-red-400 font-bold bg-red-50/50 px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">Cancelled</span>
                    ) : item.isCompleted ? (
                      <span className="text-emerald-500 font-bold bg-emerald-50/50 px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">Completed</span>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full lg:w-auto justify-end">
                        <button
                          onClick={() => cancelAppointments(item._id)}
                          className="flex items-center justify-center gap-1 text-red-500 font-medium border border-slate-200 lg:border-none hover:bg-red-50 px-2.5 py-1 lg:p-1.5 rounded-lg transition-all text-[10px] lg:w-7 lg:h-7 shrink-0"
                        >
                          <img className="w-3.5 h-3.5" src={assets.cancel_icon} alt="X" />
                          <span className="lg:hidden">Reject</span>
                        </button>
                        
                        <button
                          disabled={!item.isPinVerified}
                          onClick={(e) => {
                            if (!item.isPinVerified) {
                              toast.error("Please verify patient PIN before completing the appointment!");
                              return;
                            }
                            
                            e.currentTarget.disabled = true;
                            e.currentTarget.classList.add("opacity-50", "cursor-wait");
                            
                            completeAppointments(item._id);
                          }}
                          className={`flex items-center justify-center gap-1 font-bold border border-slate-200 lg:border-none px-2.5 py-1 lg:p-1.5 rounded-lg transition-all text-[10px] lg:w-7 lg:h-7 shrink-0 ${
                            item.isPinVerified 
                              ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer' 
                              : 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <img className={`w-3.5 h-3.5 ${!item.isPinVerified ? 'opacity-50' : ''}`} src={assets.tick_icon} alt="Y" />
                          <span className="lg:hidden">Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 font-medium text-[11px] bg-slate-50/30">
              No matching records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;