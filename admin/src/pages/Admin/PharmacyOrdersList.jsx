import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';

const PharmacyOrdersList = () => {
    const { pharmacyOrders, getAllPharmacyOrders } = useContext(AdminContext);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [imageErrors, setImageErrors] = useState({});

    // ⚠️ HALKAN BEDDEL: URL-ka backend-kaaga iyo magaca galka sawirada (sida 'uploads' ama 'images')
    const backendUrl = "http://localhost:4000"; 
    const imageFolder = "/uploads/"; 

    useEffect(() => {
        const fetchOrders = async () => {
            if (getAllPharmacyOrders) {
                setIsLoading(true);
                try {
                    await getAllPharmacyOrders();
                } catch (error) {
                    console.error("Error fetching pharmacy orders:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // SHAQADA SAWIRADA: Waxay hubinaysaa inay sawirka dhisto link buuxa haddii uusan lahayn 'http'
    const getValidImageUrl = (img) => {
        if (!img || img === '...' || img.trim() === '') return null;
        
        // Haddii sawirku durba yahay link buuxa (Cloudinary, iwm)
        if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
            return img;
        }
        
        // Haddii uu yahay magac fayl oo kaliya (sida image_123.png), waxaan ku daraynaa backendUrl iyo folder-ka
        const cleanImg = img.replace(/^\/+/, '');
        return `${backendUrl}${imageFolder}${cleanImg}`;
    };

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const filteredOrders = (pharmacyOrders || []).filter(order => {
        const matchesSearch = 
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.pharmacy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed':
            case 'delivered': 
                return 'bg-green-50 text-green-600 ring-1 ring-green-600/20';
            case 'pending': 
                return 'bg-yellow-50 text-yellow-600 ring-1 ring-yellow-600/20';
            case 'processing': 
                return 'bg-blue-50 text-blue-600 ring-1 ring-blue-600/20';
            case 'cancelled': 
                return 'bg-red-50 text-red-600 ring-1 ring-red-600/20';
            default: 
                return 'bg-gray-50 text-gray-600 ring-1 ring-gray-600/20';
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Title */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Pharmacy Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all pharmacy customer orders across the platform.</p>
                </div>

                {/* Search & Filter Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                        <input 
                            type="text"
                            placeholder="Search by order ID, patient, or pharmacy..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-0 text-gray-900 bg-white ring-1 ring-inset ring-gray-200 rounded-xl focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 shadow-sm transition-all"
                        />
                    </div>
                    
                    <div className="w-full sm:w-auto">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full py-2.5 pl-4 pr-10 border-0 text-gray-900 bg-white ring-1 ring-inset ring-gray-200 rounded-xl focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 shadow-sm cursor-pointer transition-all"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Data Display Section */}
                <div>
                    {isLoading ? (
                        <div className="w-full py-20 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="text-sm font-medium text-gray-500 mt-4">Loading orders...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-300">
                            <span className="text-4xl mb-3">📦</span>
                            <h3 className="text-base font-semibold text-gray-900">No Orders Found</h3>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or filter criteria.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pharmacy Info</th>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Info</th>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Medications</th>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note / Guideline</th>
                                            <th scope="col" className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th scope="col" className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {filteredOrders.map((order, idx) => {
                                            const pharmacyImg = getValidImageUrl(order.pharmacy?.image);
                                            const patientImg = getValidImageUrl(order.patient?.image);
                                            const pKey = `pharmacy-${order.orderId || idx}`;
                                            const uKey = `patient-${order.orderId || idx}`;

                                            return (
                                                <tr key={order.orderId || idx} className="hover:bg-gray-50/50 transition-colors duration-200">
                                                    {/* Order ID Column */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="font-semibold text-gray-900 text-xs font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
                                                            #{order.orderId?.slice(-6) || 'N/A'}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-1">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>

                                                    {/* Pharmacy Info Column */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="flex items-center gap-3">
                                                            {pharmacyImg && !imageErrors[pKey] ? (
                                                                <img 
                                                                    src={pharmacyImg} 
                                                                    alt={order.pharmacy?.name} 
                                                                    onError={() => handleImageError(pKey)}
                                                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs" 
                                                                />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs border border-indigo-100">
                                                                    {order.pharmacy?.name?.charAt(0) || 'P'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-900">{order.pharmacy?.name}</div>
                                                                <div className="text-[11px] text-gray-500 mt-0.5">{order.pharmacy?.contact}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Patient Info Column */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="flex items-center gap-3">
                                                            {patientImg && !imageErrors[uKey] ? (
                                                                <img 
                                                                    src={patientImg} 
                                                                    alt={order.patient?.name} 
                                                                    onError={() => handleImageError(uKey)}
                                                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs" 
                                                                />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs border border-emerald-100">
                                                                    {order.patient?.name?.charAt(0) || 'U'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-900">{order.patient?.name}</div>
                                                                <div className="text-[11px] text-gray-500 mt-0.5">{order.patient?.contact}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Location */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="text-xs text-gray-700 max-w-xs truncate">{order.location}</div>
                                                    </td>

                                                    {/* Medications */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="text-xs text-gray-700 max-w-xs">
                                                            {Array.isArray(order.medications) && order.medications.length > 0 ? (
                                                                order.medications.map((med, i) => (
                                                                    <div key={i} className="truncate">
                                                                        • {med.name || med.title || 'Item'} (x{med.quantity || 1})
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400">No items specified</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Note / Guideline */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="text-xs text-gray-500 italic max-w-xs">
                                                            {order.description || 'No note'}
                                                        </div>
                                                    </td>

                                                    {/* Total */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="text-sm font-bold text-gray-900">${Number(order.total || 0).toFixed(2)}</div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-4 px-6 text-center align-top">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredOrders.map((order, idx) => {
                                    const pharmacyImg = getValidImageUrl(order.pharmacy?.image);
                                    const patientImg = getValidImageUrl(order.patient?.image);
                                    const pKey = `mob-pharmacy-${order.orderId || idx}`;
                                    const uKey = `mob-patient-${order.orderId || idx}`;

                                    return (
                                        <div key={order.orderId || idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                                            
                                            {/* Top Header: Order ID & Status */}
                                            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                                                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                    #{order.orderId?.slice(-6) || 'N/A'}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* Pharmacy Section */}
                                            <div className="flex items-center gap-3 bg-gray-50/70 p-3 rounded-xl">
                                                {pharmacyImg && !imageErrors[pKey] ? (
                                                    <img 
                                                        src={pharmacyImg} 
                                                        alt="" 
                                                        onError={() => handleImageError(pKey)}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm">
                                                        {order.pharmacy?.name?.charAt(0) || 'P'}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Pharmacy</span>
                                                    <h4 className="text-xs font-bold text-gray-900">{order.pharmacy?.name}</h4>
                                                    <span className="text-[11px] text-gray-500">{order.pharmacy?.contact}</span>
                                                </div>
                                            </div>

                                            {/* Patient Section */}
                                            <div className="flex items-center gap-3 bg-gray-50/70 p-3 rounded-xl">
                                                {patientImg && !imageErrors[uKey] ? (
                                                    <img 
                                                        src={patientImg} 
                                                        alt="" 
                                                        onError={() => handleImageError(uKey)}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm">
                                                        {order.patient?.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Patient</span>
                                                    <h4 className="text-xs font-bold text-gray-900">{order.patient?.name}</h4>
                                                    <span className="text-[11px] text-gray-500">{order.patient?.contact}</span>
                                                </div>
                                            </div>

                                            {/* Order Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-50 pt-3">
                                                <div>
                                                    <span className="block text-gray-400 mb-0.5">Total Amount</span>
                                                    <span className="font-bold text-gray-900 text-sm block">${Number(order.total || 0).toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 mb-0.5">Location</span>
                                                    <span className="text-gray-700 block truncate">{order.location}</span>
                                                </div>
                                            </div>

                                            {/* Medications List */}
                                            <div className="text-xs border-t border-gray-50 pt-3">
                                                <span className="block text-gray-400 mb-1">Medications</span>
                                                <div className="text-gray-700 space-y-0.5">
                                                    {Array.isArray(order.medications) && order.medications.length > 0 ? (
                                                        order.medications.map((med, i) => (
                                                            <div key={i} className="truncate">
                                                                • {med.name || med.title || 'Item'} (x{med.quantity || 1})
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400">No items specified</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Note / Guideline Section */}
                                            {order.description && (
                                                <div className="text-xs border-t border-gray-50 pt-3">
                                                    <span className="block text-gray-400 mb-0.5 font-semibold">Note / Guideline</span>
                                                    <span className="text-gray-600 italic">{order.description}</span>
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PharmacyOrdersList;