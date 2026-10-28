import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Copy, CheckCircle, MapPin, Calendar, XCircle, KeyRound, ShieldCheck, Mail, Clock } from 'lucide-react';

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

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
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getUserAppointments = async () => {
    try {
      if (!token) return;
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setAppointments(data.appointments.slice().reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments(); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  const filteredAppointments = appointments.filter((item) => {
    const docName = (item.docData?.name || '').toLowerCase();
    const shortId = `APP-${item._id?.slice(-6).toUpperCase()}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return docName.includes(search) || shortId.includes(search);
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 font-sans antialiased">
      
      {/* Control Navigation Deck */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-100">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight sm:text-xl">My Appointments</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track and manage your upcoming clinic visits</p>
        </div>
        
        {/* Soft Minimal Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search doctor name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
          />
        </div>
      </div>

      {/* Main Core Feed Engine */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => {
            const shortId = `APP-${item._id?.slice(-6).toUpperCase()}`;
            const docName = item.docData?.name || '';
            const docImage = item.docData?.image;

            const currentStatus = item.customStatus || (item.cancelled ? "Cancelled" : item.isCompleted ? "Completed" : "Active");

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-xs transition-all duration-300 hover:border-slate-200/80 hover:shadow-md/5 gap-4"
              >
                {/* Profile Meta Segment */}
                <div className="flex gap-4 items-center min-w-0">
                  <div className="relative shrink-0">
                    {docImage && docImage.length > 5 ? (
                      <img
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50/50 object-cover rounded-xl border border-slate-100 shadow-xs"
                        src={docImage}
                        alt={docName}
                      />
                    ) : (
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br ${getAvatarGradient(docName)} flex items-center justify-center text-white font-bold text-2xl uppercase border border-white shadow-xs`}>
                        {docName ? docName.trim().charAt(0) : 'D'}
                      </div>
                    )}
                  </div>

                  {/* Core Specific Details Meta Frame */}
                  <div className="text-xs min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-slate-800 font-bold truncate text-[14px] sm:text-base tracking-tight">{docName}</h2>
                      
                      <button 
                        onClick={() => handleCopyId(item._id)}
                        className={`inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-md font-bold transition-all active:scale-95 border ${
                          copiedId === item._id 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-xs' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title="Click to copy ID"
                      >
                        <span>{shortId}</span>
                        {copiedId === item._id ? <CheckCircle size={9} /> : <Copy size={9} />}
                      </button>
                    </div>

                    <p className="text-indigo-600 font-semibold mb-2 text-[11px] bg-indigo-50/50 inline-block px-2 py-0.5 rounded-md">{item.docData?.speciality || 'General Doctor'}</p>
                    
                    <div className="space-y-1 text-slate-500 font-medium hidden sm:block">
                      <p className="flex items-center gap-1.5 text-slate-700">
                        <Calendar size={13} className="text-indigo-500 shrink-0" />
                        <span>{item.slotDate}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-indigo-600">{item.slotTime}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin size={13} className="text-slate-300 shrink-0" />
                        <span className="truncate">{item.docData?.address?.line1}, {item.docData?.address?.line2}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile schedule layout */}
                <div className="space-y-1.5 text-slate-500 font-medium block sm:hidden text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <Calendar size={12} className="text-indigo-500 shrink-0" />
                    <span>{item.slotDate}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold text-indigo-600">{item.slotTime}</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
                    <MapPin size={12} className="text-slate-300 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{item.docData?.address?.line1}, {item.docData?.address?.line2}</span>
                  </p>
                </div>

                {/* Status Logic Control Panel */}
                <div className="flex flex-col justify-center sm:items-end gap-2 shrink-0 sm:w-44 w-full">
                  
                  {/* QAYBTA: CANCELLED */}
                  {currentStatus === "Cancelled" && (
                    <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50/80 border border-red-100 rounded-xl text-red-500 text-[11px] font-bold uppercase tracking-wider select-none">
                      <XCircle size={14} />
                      <span>Cancelled</span>
                    </div>
                  )}

                  {/* QAYBTA: COMPLETED (Dhakhtarku wuu aqbalay) -> Halkan buu Code-ku kasoo baxayaa */}
                  {currentStatus === "Completed" && (
                    <div className="w-full flex flex-col gap-2 items-center">
                      <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-600 text-[11px] font-bold uppercase tracking-wider select-none">
                        <CheckCircle size={14} />
                        <span>Completed</span>
                      </div>
                      
                      {/* Sanduuqa Code-ka iyo Xaqiijinta */}
                      <div className="w-full flex flex-col gap-1.5 items-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 shadow-xs">
                        
                        {item.isPinVerified ? (
                          /* Haddi Dhakhtarku xaqiijiyay PIN-ka */
                          <span className="text-[10px] text-emerald-600 font-bold flex flex-col items-center gap-1 mt-0.5 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100 w-full text-center">
                            <ShieldCheck size={14} /> 
                            <span>Dhakhtarku wuxuu xaqiijiyay inaad kulanteen</span>
                          </span>
                        ) : (
                          /* Hadii aan wali la xaqiijin (Wuxuu sugayaa in Email-ka laga soo qaado) */
                          <>
                            <div className="flex items-center justify-center w-full gap-1.5 text-[10px] text-slate-600 font-semibold bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                              <KeyRound size={12} className="text-slate-400" />
                              <span>Meeting PIN: <span className="font-mono text-slate-400 tracking-widest ml-1">****</span></span>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1 mt-1 text-center">
                              <Mail size={12} /> Code-ka ka eeg Email-kaaga
                            </span>
                          </>
                        )}

                      </div>
                    </div>
                  )}

                  {/* QAYBTA: ACTIVE (Lacagtii waa la bixiyay, sugitaan dhakhtar) */}
                  {currentStatus === "Active" && (
                    <div className="w-full flex flex-col gap-2 items-center">
                      <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50/80 border border-blue-100 rounded-xl text-blue-600 text-[10px] font-bold uppercase tracking-wider select-none">
                        <Clock size={13} />
                        <span>Sugitaan Dhakhtar</span>
                      </div>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="w-full text-center px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 active:scale-[0.98]"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4 text-slate-400 font-medium text-xs bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
            Ma jiro wax balan ah oo laga helay raadintaada.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;