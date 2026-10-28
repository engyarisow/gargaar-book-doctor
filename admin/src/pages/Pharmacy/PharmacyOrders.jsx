import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Halkan ayaan ku darnay useNavigate
import { Search, MapPin, Phone, Mail, FileText, CheckCircle, X, ChevronDown, MoreVertical, AlignLeft } from 'lucide-react';
import { PharmacyContext } from '../../context/PharmacyContext'; 

const PharmacyOrders = () => {
    const { orders, changeOrderStatus, profileData } = useContext(PharmacyContext); 
    const navigate = useNavigate(); // 👈 Halkan ayaan initialize garaynay
    
    const [searchTerm, setSearchTerm] = useState('');
    
    // State-ka Modal-ka Xaqiijinta PIN-ka
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [inputCode, setInputCode] = useState('');

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Placed': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Processing': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const filteredOrders = orders?.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const patientName = order.userId?.name?.toLowerCase() || '';
        const orderId = order._id?.toLowerCase() || '';
        return patientName.includes(searchLower) || orderId.includes(searchLower);
    }) || [];

    // 🖨️ NIDAAMKA INVOICE-KA EE CUSUB (NAVIGATION KALIYA)
    const handleGenerateInvoice = (order) => {
        // Hadda koodhkii html-ka ahaa meesha waa laga saaray
        // Waxaan u diraynaa bogga cusub, anagoo sii raacinayna xogta dalabka (order state)
        navigate('/pharmacy-invoice', { state: { orderData: order } });
    };

    // 🔄 SHARCIGA DROPDOWN-KA (CANCEL & DELIVERED WAA LA XIRAY)
    const handleStatusChange = async (order, newStatus) => {
        if (newStatus === order.orderStatus) return;
        
        // 1. Haddii uu horey u xirnaa
        if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
            alert("Dalabkan waa la xiray, waxba lagama beddeli karo!");
            return;
        }

        // 2. Haddii la rabo in laga dhigo Delivered
        if (newStatus === 'Delivered') {
            setSelectedOrder(order);
            setInputCode('');
            setVerifyModalOpen(true);
            return;
        }

        // 3. Haddii la rabo in laga dhigo Cancelled
        if (newStatus === 'Cancelled') {
            const confirmCancel = window.confirm("Ma hubtaa inaad joojinayso dalabkan? Haddaad joojiso dib looma furi karo.");
            if (!confirmCancel) return; // Jooji haddii uusan OK dhihin
        }

        // 4. Update garee xaaladaha kale (iyo Cancelled markii la xaqiijiyo)
        try {
            if (changeOrderStatus) {
                const result = await changeOrderStatus(order._id, newStatus);
                if (result && !result.success) {
                    alert(result.message);
                } else if (result && result.success && newStatus === 'Cancelled') {
                    alert("Dalabkii waa la joojiyay (Cancelled), waana la xiray.");
                }
            }
        } catch (error) {
            console.error("Cilad lama filaan ah:", error);
            alert("Cilad ayaa dhacday, fadlan isku day markale.");
        }
    };

    // 🔐 Xaqiijinta Modal-ka (PIN)
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        
        if (!inputCode) {
            alert("Fadlan geli koodhka xaqiijinta!");
            return;
        }

        try {
            if (changeOrderStatus) {
                const result = await changeOrderStatus(selectedOrder._id, 'Delivered', inputCode);
                
                if (result && result.success) {
                    setVerifyModalOpen(false);
                    setInputCode('');
                    alert("✅ Dalabkii si guul ah ayaa loo xaqiijiyay!");
                } else {
                    alert(result?.message || "❌ Koodhka xaqiijintu waa khalad!"); 
                }
            }
        } catch (error) {
            console.error("Cilad xaqiijinta ah:", error);
            alert("Cilad lama filaan ah ayaa dhacday.");
        }
    };

    // 📍 SAXIDDA CIWAANKA
    const displayAddress = (addressObj) => {
        if (!addressObj) return 'Ciwaan lama helin';
        if (addressObj.location) return addressObj.location; 
        
        const street = addressObj.street || addressObj.line1 || addressObj.address || '';
        const city = addressObj.city || addressObj.state || '';
        return `${street ? street + ',' : ''} ${city}`.trim() || 'Ciwaanka lama faahfaahin';
    };

    return (
        <div className="p-4 sm:p-8 w-full relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Prescription Orders</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage, update status, and verify completed deliveries.</p>
                </div>
                
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search patient or order ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Patient & Contact</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Medications</th>
                            <th className="px-6 py-4">Description / Note</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status Update</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700">#{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="text-slate-700 font-medium">{order.userId?.name || 'Unknown Patient'}</div>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                            <Mail size={12} /> {order.userId?.email || 'N/A'}
                                        </div>
                                        {(order.address?.phone || order.address?.phoneNumber) && (
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                                <Phone size={12} /> {order.address.phone || order.address.phoneNumber}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2 text-slate-600 max-w-[150px] whitespace-normal">
                                            <MapPin size={14} className="mt-0.5 text-blue-500 flex-shrink-0" />
                                            <span className="text-xs">{displayAddress(order.address)}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="max-w-[180px]">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="text-xs text-slate-600 truncate mb-1">
                                                    <span className="font-medium text-slate-700">{item.quantity}x</span> {item.name || item.medicineId?.name || 'Item'}
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="max-w-[250px] whitespace-normal flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <AlignLeft size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                                {order.address?.notes || order.note || order.description || "Faahfaahin dheeri ah laguma soo darin dalabkan."}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-slate-700 font-bold">
                                        ${order.totalAmount?.toFixed(2) || '0.00'}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="relative inline-block w-32">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleStatusChange(order, e.target.value)}
                                                // 👇 Halkan ayuu Dropdown-ku ka xirmayaa haddii ay Cancelled ama Delivered tahay
                                                disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                                                className={`appearance-none w-full px-3 py-1.5 pr-8 rounded-full text-xs font-bold border outline-none cursor-pointer transition-all ${getStatusStyle(order.orderStatus)} ${(order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') ? 'opacity-60 cursor-not-allowed grayscale-[20%]' : 'hover:shadow-sm'}`}
                                            >
                                                <option value="Placed">Placed</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                            <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${(order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') ? 'text-slate-300' : 'text-slate-400'}`} />
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleGenerateInvoice(order)}
                                                className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all text-xs font-medium shadow-sm"
                                                title="View Invoice"
                                            >
                                                <FileText size={14} />
                                                Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* POPUP-KA VERIFICATION-KA PIN-KA */}
            {verifyModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle className="text-blue-600" size={18}/> 
                                Verify Delivery #{selectedOrder._id ? selectedOrder._id.slice(-6).toUpperCase() : ''}
                            </h3>
                            <button onClick={() => setVerifyModalOpen(false)} className="text-slate-400 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleVerifySubmit} className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Si dalabka loogu beddelo <strong className="text-emerald-600">"Delivered"</strong>, fadlan geli koodhka xaqiijinta ee bukaanka.
                            </p>
                            
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Verification Code
                                </label>
                                <input 
                                    type="text" 
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                    placeholder="Enter PIN..." 
                                    className="w-full text-center text-2xl tracking-[0.5em] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setVerifyModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors"
                                >
                                    Verify & Complete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyOrders;