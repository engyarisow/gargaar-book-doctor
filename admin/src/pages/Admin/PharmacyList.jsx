import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const PharmacyList = () => {
    const { pharmacies, getAllPharmacies, toggleBlockPharmacy } = useContext(AdminContext);

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            if (getAllPharmacies) {
                setIsLoading(true);
                try {
                    await getAllPharmacies();
                } catch (error) {
                    console.error("Error fetching pharmacies:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        fetchData();
    }, []); 

    const handleStatusUpdate = async (id) => {
        try {
            if (toggleBlockPharmacy) {
                await toggleBlockPharmacy(id); 
            }
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    // 📋 Function-ka Copy-ga sameynaya ID-ga
    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        toast.success("Pharmacy ID copied!");
    };

    // Sifeeynta xogta (Search & Status Filter)
    const filteredPharmacies = (pharmacies || []).filter(pharmacy => {
        if (pharmacy.isDeleted) return false; 

        const matchesSearch = 
            pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.pharmacistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pharmacy.locationText?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || pharmacy.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className='m-5 h-[90vh] overflow-y-auto no-scrollbar font-sans'>

            {/* Header & Search/Filter Section */}
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-6'>
                <h1 className='text-2xl font-semibold text-gray-800'>
                    All Pharmacies
                </h1>

                <div className='flex items-center gap-3 w-full sm:w-auto'>
                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                        <input 
                            type="text"
                            placeholder="Search pharmacies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-3 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* LOADING / EMPTY / GRID CONTENT */}
            {isLoading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="text-sm font-medium text-gray-500 mt-4">Loading data...</span>
                </div>
            ) : filteredPharmacies.length === 0 ? (
                <div className='col-span-full flex flex-col items-center justify-center h-[50vh] text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200'>
                    <span className='text-4xl mb-2'>💊</span>
                    <p className='text-lg font-medium text-gray-700'>Wali ma jiraan farmasiyo la soo bandhigo.</p>
                </div>
            ) : (
                /* GRID LAYOUT (Qaabkii Hospital/Doctor List) */
                <div className='grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6'>
                    {filteredPharmacies.map((item) => (
                        <div
                            key={item._id}
                            className='bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group relative'
                        >
                            
                            {/* 🔴 SUSPENDED / BLOCKED BADGE */}
                            {item.status === 'Suspended' && (
                                <span className='absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider'>
                                    Suspended
                                </span>
                            )}

                            {/* Image / Logo Section */}
                            <div className='relative bg-gray-50 h-48 flex items-center justify-center'>
                                <img
                                    className={`w-32 h-32 object-contain p-2 group-hover:scale-110 transition-all duration-500 
                                        ${item.status === 'Suspended' ? 'grayscale opacity-40' : ''}`}
                                    src={item.image || ''}
                                    alt={item.name}
                                    onError={(e)=>{e.target.onerror=null; e.target.src="https://via.placeholder.com/150?text=Pharmacy"}}
                                />

                                {/* Status Indicator Badge */}
                                <span
                                    className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter
                                    ${item.status === 'Active' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                >
                                    {item.status || 'Pending'}
                                </span>
                            </div>

                            {/* Information Content Section */}
                            <div className='p-4'>

                                {/* PHARMACY ID W/ COPY BUTTON */}
                                <div 
                                    onClick={() => copyToClipboard(item._id)}
                                    title="Click to copy full ID"
                                    className='inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded cursor-pointer transition-colors mb-1.5'
                                >
                                    <p className='text-[10px] font-mono font-bold text-gray-500 uppercase'>
                                        pha:{item._id.slice(-4)}
                                    </p>
                                    <svg className="w-3 h-3 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>

                                <p className='text-lg font-semibold text-gray-900 truncate' title={item.name}>
                                    {item.name || "Unnamed Pharmacy"}
                                </p>

                                <p className='text-sm text-indigo-500 font-medium mt-0.5 truncate'>
                                    📍 {item.locationText || "Location not set"}
                                </p>

                                {/* Details Row: Pharmacist & Wallet Balance */}
                                <div className='mt-3 flex items-center justify-between text-xs border-y border-gray-50 py-3'>
                                    <div>
                                        <p className='text-gray-400'>pharmacist</p>
                                        <p className='font-bold text-gray-700 truncate max-w-[90px]' title={item.pharmacistName}>
                                            {item.pharmacistName || 'N/A'}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-gray-400'>balance</p>
                                        <p className='font-bold text-indigo-600'>
                                            ${(item.walletBalance || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* ACTION BUTTON: Suspend / Activate */}
                                <button
                                    onClick={() => handleStatusUpdate(item._id)}
                                    className={`mt-4 w-full py-2 rounded-lg text-sm font-bold transition-all duration-300
                                        ${item.status === 'Active'
                                            ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100" 
                                            : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                                        }`}
                                >
                                    {item.status === 'Active' ? 'Suspend Pharmacy' : 'Activate Pharmacy'}
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PharmacyList;