import React, { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext'; 
import { MapPin, Phone, FileText, ShoppingBag, ShieldCheck } from 'lucide-react';

const PlaceOrder = () => {
    const { backendUrl, token, cartItems, getCartAmount, pharmaciesWithProducts } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    // 1. STATE-KA FOOMKA XOGTA MACMIILKA
    const [formData, setFormData] = useState({
        phone: '',
        location: '',
        notes: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xisaabinta lacagta (Kaliya waxaan u isticmaalaynaa inaan UI-ga ugu muujino macmiilka)
    const totalAmount = useMemo(() => {
        if (typeof getCartAmount === 'function') {
            return getCartAmount();
        }
        
        let total = 0;
        if (pharmaciesWithProducts && cartItems) {
            for (const itemId in cartItems) {
                if (cartItems[itemId] > 0) {
                    for (const pharmacy of pharmaciesWithProducts) {
                        const product = pharmacy.products.find(p => p._id === itemId);
                        if (product) {
                            total += product.price * cartItems[itemId];
                            break;
                        }
                    }
                }
            }
        }
        return total;
    }, [getCartAmount, cartItems, pharmaciesWithProducts]);

    const handleCheckout = async () => {
        try {
            // Hubinta in foomka la buuxiyay
            if (!formData.phone || !formData.location) {
                toast.error("Fadlan buuxi lambarkaaga iyo cinwaanka laguugu keenayo daawada!");
                return;
            }

            if (totalAmount === 0) {
                toast.error("Cart-gaagu waa maran yahay!");
                return;
            }

            setLoading(true);

            let realPharmacyId = "";
            let orderItems = [];

            // Diyaarinta xogta dawooyinka
            if (pharmaciesWithProducts && cartItems) {
                for (const itemId in cartItems) {
                    if (cartItems[itemId] > 0) {
                        for (const pharmacy of pharmaciesWithProducts) {
                            const product = pharmacy.products.find(p => p._id === itemId);
                            if (product) {
                                realPharmacyId = pharmacy._id; 
                                
                                // 🛡️ Kaliya xogta daruuriga ah ayaan diyaarinaynaa
                                orderItems.push({
                                    medicineId: product._id,
                                    quantity: cartItems[itemId]
                                });
                                break; 
                            }
                        }
                    }
                }
            }

            if (!realPharmacyId || orderItems.length === 0) {
                toast.error("Kama helin xogta Farmashiyaha cart-gaaga!");
                setLoading(false);
                return;
            }
            
            // 🚀 XOGTA LOO DIRAYO BACKEND-KA (SECURE PAYLOAD)
            // Hadda ma dirayno lacagaha, Backend-ka ayaa isagu xisaabsanaya
            const orderData = {
                pharmacyId: realPharmacyId,
                items: orderItems, 
                address: { 
                    phone: formData.phone, 
                    location: formData.location,
                    notes: formData.notes 
                } 
            };

            const response = await axios.post(
                `${backendUrl}/api/user/place-order-stripe`, 
                orderData, 
                { headers: { Authorization: `Bearer ${token}` } } 
            );

            if (response.data.success) {
                // U weeci Stripe Checkout
                window.location.replace(response.data.session_url);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Cilad ayaa dhacday! Fadlan dib isku day.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen bg-[#f8fafc]">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>
                <p className="text-slate-500 mt-2">Buuxi xogtaada si dalabkaagu kuugu yimaado.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* ─── QAYBTA BIDIX: FOOMKA XOGTA MACMIILKA (Delivery Details) ─── */}
                <div className="lg:w-2/3 space-y-6">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <MapPin className="text-indigo-600" /> Delivery Information
                        </h2>

                        <div className="space-y-5">
                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Contact Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone size={18} className="text-slate-400" />
                                    </div>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Tusaale: 063XXXXXXX ama 065XXXXXXX"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Location / Address */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Delivery Location <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MapPin size={18} className="text-slate-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Tusaale: Jigjiga Yar, Hargeisa"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Description / Notes */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Additional Instructions (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                                        <FileText size={18} className="text-slate-400" />
                                    </div>
                                    <textarea 
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Fariin gaar ah oo aad u reebayso farmashiyaha ama qofka kuu keenaya daawada..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── QAYBTA MIDIG: ORDER SUMMARY & PAYMENT BATOONKA ─── */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 sticky top-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ShoppingBag className="text-indigo-600" /> Order Summary
                        </h2>

                        <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium">${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Delivery Fee</span>
                                <span className="font-medium text-emerald-600">Free</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-slate-500 font-medium">Total to Pay</span>
                            <span className="text-3xl font-black text-slate-900">${totalAmount.toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={handleCheckout} 
                            disabled={loading || totalAmount === 0 || !formData.phone || !formData.location}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-6 py-4 rounded-xl hover:bg-indigo-600 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] shadow-sm hover:shadow-lg"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>💳 Pay with Stripe</>
                            )}
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            Guaranteed safe & secure checkout
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PlaceOrder;