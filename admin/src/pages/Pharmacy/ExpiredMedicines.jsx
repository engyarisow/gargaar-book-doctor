import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PharmacyContext } from '../../context/PharmacyContext';
import { Clock, AlertOctagon, Trash2, RefreshCw } from 'lucide-react';

const ExpiredMedicines = () => {
    const { backendUrl, pToken, getPharmacyProducts, getPharmacyAlerts } = useContext(PharmacyContext);
    const [expiredMeds, setExpiredMeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExpired = async () => {
        if (!pToken) return;

        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/pharmacy/expired`, {
                headers: { ptoken: pToken } 
            });

            if (data.success) {
                setExpiredMeds(data.medicines);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpired();
    }, [pToken]);

    const handleRemove = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expired medicine? This action cannot be undone.")) return;
        
        try {
            const { data } = await axios.delete(`${backendUrl}/api/pharmacy/delete-product/${id}`, {
                headers: { ptoken: pToken }
            });

            if (data.success) {
                toast.success("Medicine deleted successfully.");
                fetchExpired(); 
                if(getPharmacyProducts) getPharmacyProducts(); 
                if(getPharmacyAlerts) getPharmacyAlerts(); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred, please try again.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-slate-50/50">
            {/* Header Section - Modern & Small */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <AlertOctagon className="text-red-500" size={18} />
                        Expired Medicines
                    </h1>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        List of expired medicines that need to be removed or disposed of.
                    </p>
                </div>
                <button 
                    onClick={fetchExpired} 
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs uppercase tracking-wider px-4 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm font-bold w-full md:w-auto"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
                    Refresh
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                                <th className="p-4">Medicine Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Expiry Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400 text-xs uppercase tracking-widest font-medium">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : expiredMeds.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                                        <div className="bg-slate-50 p-3 rounded-full border border-slate-100">
                                            <Clock size={24} className="text-slate-300" />
                                        </div>
                                        <span className="text-xs uppercase tracking-widest font-semibold">No expired medicines</span>
                                    </td>
                                </tr>
                            ) : (
                                expiredMeds.map((med, index) => {
                                    const expDate = new Date(med.expiryDate);
                                    const formattedDate = expDate.toLocaleDateString('en-GB', { 
                                        day: '2-digit', month: 'short', year: 'numeric' 
                                    });

                                    return (
                                        <tr key={med._id || index} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 font-semibold text-slate-800">{med.name}</td>
                                            <td className="p-4 text-slate-500 font-medium">{med.category || 'N/A'}</td>
                                            <td className="p-4 font-semibold text-slate-700">
                                                {formattedDate}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                                    Expired
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleRemove(med._id)}
                                                    className="inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-red-600 hover:text-white bg-white border border-red-200 hover:bg-red-500 px-3 py-1.5 rounded-md transition-all shadow-sm"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpiredMedicines;