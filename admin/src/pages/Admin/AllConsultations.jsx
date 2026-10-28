import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { Video, User, CheckCircle2, XCircle, Clock, Search, Copy, CheckCircle } from 'lucide-react';

const AllConsultations = () => {
    const { consultations, getAllConsultations, loading } = useContext(AdminContext);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        getAllConsultations();
    }, []);

    // Sacaada ha cusboonaato 30-kii ilbidhiqsiba si "Waiting Time" u noqdo mid Live ah
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    // Function-ka Copy ID-ga
    const handleCopyId = (id) => {
        const cleanId = id.slice(-6).toUpperCase();
        navigator.clipboard.writeText(`CON-${cleanId}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter-ka Search-ga
    const filteredConsultations = consultations.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const patientName = (item.patientId?.name || '').toLowerCase();
        const doctorName = (item.doctorId?.name || '').toLowerCase();
        const shortId = `CON-${item._id?.slice(-6).toUpperCase()}`.toLowerCase();
        return patientName.includes(searchLower) || doctorName.includes(searchLower) || shortId.includes(searchLower);
    });

    // 1. Logic-ga Xaadiritaanka (Attendance) iyadoo laga eegayo Database-ka rasmiga ah
    const getAttendanceBadge = (item) => {
        const drJoined = !!item.videoSession?.doctorJoinedAt;
        const ptJoined = !!item.videoSession?.patientJoinedAt;

        if (drJoined && ptJoined) {
            return { text: "Both Joined", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
        } else if (drJoined) {
            return { text: "Doctor Joined", style: "bg-blue-50 text-blue-700 border-blue-200" };
        } else if (ptJoined) {
            return { text: "Patient Joined", style: "bg-amber-50 text-amber-700 border-amber-200" };
        } else {
            return { text: "Not Joined Yet", style: "bg-slate-50 text-slate-500 border-slate-200" };
        }
    };

    // 2. Logic-ga Xaaladda (Status & Waiting Time)
    const getStatusDisplay = (item) => {
        if (item.cancelled) return { text: "Cancelled", color: "text-rose-500 font-bold", icon: <XCircle className="w-3.5 h-3.5" /> };
        if (item.isCompleted || item.status === 'completed') return { text: "Completed", color: "text-emerald-600 font-bold", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
        if (item.status === 'in-progress') return { text: "In Progress", color: "text-blue-600 font-bold animate-pulse", icon: <Video className="w-3.5 h-3.5" /> };

        // Xisaabinta Waqtiga (Waiting Time Logic)
        const apptTime = new Date(`${item.slotDate} ${item.slotTime}`);
        if (currentTime < apptTime) {
            return { text: "Waiting...", color: "text-amber-500 font-semibold", icon: <Clock className="w-3.5 h-3.5" /> };
        } else {
            return { text: "Active / Ready", color: "text-emerald-500 font-bold animate-pulse", icon: <div className="w-2 h-2 rounded-full bg-emerald-500"></div> };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 w-full min-h-screen bg-slate-50/50 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Video className="text-blue-600 w-5 h-5" />
                            Consultations Overview
                        </h1>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Manage and monitor all video sessions in real-time.</p>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                    <th className="py-4 px-5">ID</th>
                                    <th className="py-4 px-5">Patient</th>
                                    <th className="py-4 px-5">Doctor</th>
                                    <th className="py-4 px-5">Schedule</th>
                                    <th className="py-4 px-5 text-center">Attendance</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">Fee</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-700 divide-y divide-slate-50">
                                {filteredConsultations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                                            No consultations found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredConsultations.reverse().map((item) => {
                                        const shortId = `CON-${item._id?.slice(-6).toUpperCase()}`;
                                        const attendance = getAttendanceBadge(item);
                                        const statusObj = getStatusDisplay(item);

                                        return (
                                            <tr key={item._id} className="hover:bg-blue-50/40 transition-colors group">
                                                
                                                {/* ID Column with Copy feature */}
                                                <td className="py-4 px-5 font-mono">
                                                    <button 
                                                        onClick={() => handleCopyId(item._id)} 
                                                        className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                                                    >
                                                        {shortId} 
                                                        {copiedId === item._id ? <CheckCircle size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                    </button>
                                                </td>

                                                {/* Patient Column */}
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2.5">
                                                        {item.patientId?.image ? (
                                                            <img className="w-8 h-8 rounded-full object-cover border border-slate-100" src={item.patientId.image} alt="" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-slate-400"/>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-slate-900">{item.patientId?.name || "Deleted User"}</p>
                                                            <p className="text-[10px] font-medium text-slate-400">{item.patientId?.email || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Doctor Column */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <p className="font-bold text-slate-900">Dr. {item.doctorId?.name || "Deleted Doctor"}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{item.doctorId?.speciality || "Speciality N/A"}</p>
                                                    </div>
                                                </td>

                                                {/* Schedule Column */}
                                                <td className="py-4 px-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{item.slotDate}</span>
                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3 h-3 text-blue-400" /> {item.slotTime}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Attendance Column */}
                                                <td className="py-4 px-5 text-center">
                                                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md border ${attendance.style}`}>
                                                        {attendance.text}
                                                    </span>
                                                </td>

                                                {/* Status Column */}
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`flex items-center gap-1.5 ${statusObj.color}`}>
                                                            {statusObj.icon} {statusObj.text}
                                                        </span>
                                                    </div>
                                                    {item.cancelReason && (
                                                        <p className="text-[9px] font-medium text-slate-400 mt-1 italic max-w-[150px] truncate" title={item.cancelReason}>
                                                            ({item.cancelReason})
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Fee Column */}
                                                <td className="py-4 px-5 text-right font-black text-slate-800">
                                                    ${item.amount}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllConsultations;