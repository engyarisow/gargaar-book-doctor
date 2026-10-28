// Cart.jsx
import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Cart = () => {
    const { 
        cartItems, 
        pharmaciesWithProducts, 
        currencySymbol, 
        updateCartQuantity, 
        getCartAmount 
    } = useContext(AppContext);
    
    const navigate = useNavigate();

    // Soo ururi xogta dawooyinka ku jira cart-ga
    const cartData = useMemo(() => {
        let items = [];
        if (!pharmaciesWithProducts || !cartItems) return items;

        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                for (const pharmacy of pharmaciesWithProducts) {
                    const product = pharmacy.products.find(p => p._id === itemId);
                    if (product) {
                        items.push({
                            ...product,
                            quantity: cartItems[itemId],
                            pharmacyName: pharmacy.name
                        });
                        break;
                    }
                }
            }
        }
        return items;
    }, [cartItems, pharmaciesWithProducts]);

    const totalAmount = getCartAmount ? getCartAmount() : cartData.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 🛑 MUUQAALKA MARKA CART-GU MARAN YAHAY
    if (cartData.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
                <p className="text-slate-500 mb-8">Looks like you haven't added any medicines yet.</p>
                <button 
                    onClick={() => navigate('/pharmacy')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-colors font-bold shadow-md hover:shadow-lg"
                >
                    <ArrowLeft size={20} /> Go to Pharmacies
                </button>
            </div>
        );
    }

    // ✅ MUUQAALKA MARKA XOG KU JIRTO CART-GA
    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                    <span className="bg-indigo-100 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm">
                        {cartData.length} {cartData.length === 1 ? 'Item' : 'Items'}
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* QAYBTA BIDIX: Liiska Items-ka */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        {cartData.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                                
                                <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 p-2 border border-slate-100">
                                    <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                                        {item.pharmacyName}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 truncate">{item.name}</h3>
                                    <p className="text-xl font-black text-slate-900 mt-2">{currencySymbol}{item.price.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                                    {/* Batoonnada Tirada (+ / -) */}
                                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200">
                                        <button 
                                            onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {/* Batoonka Tirtiridda (Safe Delete) */}
                                    <button 
                                        onClick={() => updateCartQuantity(item._id, 0)}
                                        className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* QAYBTA MIDIG: Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-6">
                            <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 text-slate-600 font-medium mb-6">
                                <div className="flex justify-between items-center">
                                    <span>Total Items</span>
                                    <span className="font-bold text-slate-900">
                                        {cartData.reduce((acc, item) => acc + item.quantity, 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6 mb-8 flex justify-between items-center">
                                <span className="text-slate-900 font-bold">Total Amount</span>
                                <span className="text-3xl font-black text-indigo-600">{currencySymbol}{totalAmount.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={() => navigate('/place-order')}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold px-6 py-4 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 group"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;