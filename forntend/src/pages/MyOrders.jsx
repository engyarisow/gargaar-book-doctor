import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Loader2, Package, CheckCircle2, Clock, XCircle, ChevronRight, Store, Mail, Search, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const { orders, getUserOrders, token } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    
    // U gaar ah Search-ga iyo Copy-ga
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if (token) {
            getUserOrders().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token, getUserOrders]);

    // Qaabeynta Taariikhda
    const formatDate = (dateString) => {
        if (!dateString) return "Taariikh ma cadda";
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Naqshadaynta Status-ka
    const getStatusUI = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'delivered' || s === 'completed') {
            return { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={14} /> };
        }
        if (s === 'cancelled' || s === 'failed') {
            return { color: 'text-rose-700 bg-rose-50 border-rose-200', icon: <XCircle size={14} /> };
        }
        return { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: <Clock size={14} /> };
    };

    // Copy Function
    const handleCopy = (orderId) => {
        const shortId = `ORD-${orderId.slice(-6).toUpperCase()}`;
        navigator.clipboard.writeText(shortId);
        setCopiedId(orderId);
        // Ku celi icon-ka sidisii hore 2 ilbiriqsi kadib
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter gareynta Dalabaadka (Search Logic)
    const filteredOrders = orders?.filter(order => {
        if (!searchQuery) return true;
        
        const searchLower = searchQuery.toLowerCase();
        const shortId = `ord-${order._id.slice(-6).toLowerCase()}`;
        const pharmacyName = (order.pharmacyId?.name || order.pharmacyName || "").toLowerCase();
        
        return shortId.includes(searchLower) || pharmacyName.includes(searchLower);
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 size={32} className="text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
            {/* Header & Search Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
                    <button onClick={getUserOrders} className="text-sm text-indigo-600 font-medium hover:underline">
                        Refresh
                    </button>
                </div>

                {/* Search Input */}
                {orders && orders.length > 0 && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Order ID (e.g., ORD-...) or Pharmacy..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                        />
                    </div>
                )}
            </div>

            {/* Haddii aysan jirin wax dalab ah gabi ahaanba */}
            {!orders || orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Weli wax dalab ah ma jiraan</h3>
                    <p className="text-slate-500 text-sm mb-6">Daawooyinka aad iibsatid halkan ayay kasoo muuqan doonaan.</p>
                    <Link to="/" className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors">
                        Sii dukaamayso
                    </Link>
                </div>
            ) : filteredOrders.length === 0 ? (
                /* Haddii Search-ga uusan waxba helin */
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <Search size={32} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-semibold text-slate-700">Wax natiijo ah lama helin</h3>
                    <p className="text-slate-500 text-sm mt-1">Lama helin dalab u dhigma "{searchQuery}"</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {filteredOrders.map((order, index) => {
                        const statusUI = getStatusUI(order.orderStatus || order.status);
                        const firstItem = order.items?.[0];
                        
                        const imageUrl = firstItem?.medicineId?.image || firstItem?.image;
                        const extraItemsCount = (order.items?.length || 1) - 1;
                        
                        const pharmacyName = order.pharmacyId?.name || order.pharmacyName || "Farmashiyaha Ma Cadda";
                        const pharmacyLogo = order.pharmacyId?.image; 

                        return (
                            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col gap-4">
                                
                                {/* 1. FARMASHIYAHA & STATUS */}
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                                            {pharmacyLogo ? (
                                                <img src={pharmacyLogo} alt={pharmacyName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Store size={14} className="text-indigo-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sold by</p>
                                            <h3 className="text-sm font-bold text-slate-800">{pharmacyName}</h3>
                                        </div>
                                    </div>
                                    
                                    <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-xs font-bold ${statusUI.color}`}>
                                        {statusUI.icon}
                                        {order.orderStatus || order.status || 'Processing'}
                                    </div>
                                </div>

                                {/* 2. SAWIRKA PRODUCT-GA & XOGTIISA */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Product" 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                                />
                                            ) : (
                                                <Package size={24} className="text-slate-300" />
                                            )}
                                            {extraItemsCount > 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                                    <span className="text-white text-xs font-black">+{extraItemsCount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            {/* 🚀 HALKAN AYAA LAGA BEDDELAY ORDER ID IYO COPY ICON */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-black text-slate-900 tracking-wider">
                                                    ORD-{order._id.slice(-6).toUpperCase()}
                                                </span>
                                                <button 
                                                    onClick={() => handleCopy(order._id)}
                                                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Copy Order ID"
                                                >
                                                    {copiedId === order._id ? (
                                                        <Check size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 mb-1">
                                                {formatDate(order.createdAt || order.date)}
                                            </p>
                                            <p className="text-base font-black text-indigo-600">
                                                ${order.totalAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                {/* 3. FARIINTA EMAIL-KA (VERIFICATION MESSAGE) */}
                                {((order.orderStatus || order.status) === 'Processing' || !order.isVerified) && (
                                    <div className="mt-1 bg-amber-50/80 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                                        <div className="mt-0.5 bg-amber-100 p-1.5 rounded-lg text-amber-600">
                                            <Mail size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Verification Code Sent!</p>
                                            <p className="text-xs font-medium text-slate-600 mt-0.5 leading-relaxed">
                                                We have sent a 6-digit verification code to your email. Please provide this code to the pharmacy or delivery agent to receive your order.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;