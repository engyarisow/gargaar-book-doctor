import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PharmacyContext } from '../../context/PharmacyContext';
import { AlertTriangle, PackageX, RefreshCw } from 'lucide-react';

const OutOfStock = () => {
    const { backendUrl, pToken, getPharmacyProducts, getPharmacyAlerts } = useContext(PharmacyContext);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOutOfStock = async () => {
        if (!pToken) return;
        
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/pharmacy/out-of-stock`, {
                headers: { ptoken: pToken }
            });

            if (data.success) {
                setMedicines(data.medicines);
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
        fetchOutOfStock();
    }, [pToken]);

    // Function-ka cusub ee Stock-ga cusboonaysiinaya
    const handleUpdateStock = async (id) => {
        const newStockStr = window.prompt("Geli tirada cusub ee daawadan (New Stock Quantity):", "10");
        
        // Haddii la cancel gareeyo ama la eber ka dhigo
        if (newStockStr === null || newStockStr.trim() === "") return;

        const quantity = parseInt(newStockStr);

        // Hubi in tiradu tahay nambar sax ah oo ka weyn 0
        if (isNaN(quantity) || quantity <= 0) {
            toast.error("Fadlan geli tiro sax ah oo ka weyn 0.");
            return;
        }

        try {
            const { data } = await axios.post(`${backendUrl}/api/pharmacy/update-stock`, {
                medicineId: id,
                quantity: quantity
            }, {
                headers: { ptoken: pToken }
            });

            if (data.success) {
                toast.success("Stock updated successfully!");
                fetchOutOfStock(); // Dib u cusboonaysii miiska (ka saar daawada Out of stock-ga)
                if(getPharmacyProducts) getPharmacyProducts(); // Cusboonaysii xogta guud
                if(getPharmacyAlerts) getPharmacyAlerts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Cilad ayaa dhacday, fadlan mar kale isku day.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-sm font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <PackageX className="text-rose-500" size={18} />
                        Out of stock
                    </h1>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        Medicines that are out of stock and need to be restocked.
                    </p>
                </div>
                <button 
                    onClick={fetchOutOfStock} 
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
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
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
                            ) : medicines.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                                        <div className="bg-slate-50 p-3 rounded-full border border-slate-100">
                                            <PackageX size={24} className="text-slate-300" />
                                        </div>
                                        <span className="text-xs uppercase tracking-widest font-semibold">No out of stock items</span>
                                    </td>
                                </tr>
                            ) : (
                                medicines.map((med, index) => (
                                    <tr key={med._id || index} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 font-semibold text-slate-800">{med.name}</td>
                                        <td className="p-4 text-slate-500 font-medium">{med.category}</td>
                                        <td className="p-4 text-slate-600 font-medium">${med.price}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                                                <AlertTriangle size={12} /> {med.quantity} (Zero)
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {/* Button-ka halkan ayaa lagu xiray function-ka */}
                                            <button 
                                                onClick={() => handleUpdateStock(med._id)}
                                                className="text-[11px] uppercase tracking-wider font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-all shadow-sm"
                                            >
                                                Update Stock
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OutOfStock;