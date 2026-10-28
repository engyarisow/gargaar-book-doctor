import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import { MapPin, Star, ArrowLeft, ArrowRight, Activity, Package, Phone, CheckCircle2, ShoppingBag, MessageCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const PharmacyShowcase = () => {
    const [view, setView] = useState('pharmacies'); 
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const navigate = useNavigate(); 
    
    const { 
        pharmaciesWithProducts, 
        currencySymbol, 
        addToCart, 
        updateCartQuantity, 
        cartItems 
    } = useContext(AppContext);

    const getInitials = (name) => {
        if (!name) return 'PH';
        const words = name.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const bgGradients = [
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-purple-500 to-pink-600',
        'from-amber-500 to-orange-600'
    ];
    
    const getBgGradient = (index) => bgGradients[index % bgGradients.length];

    const activeProducts = selectedPharmacy?.products || [];

    if (!pharmaciesWithProducts) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-bold text-slate-400 text-sm tracking-widest uppercase">Loading Data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#f8fafc] min-h-screen py-12 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* ─── VIEW 1: ALL PHARMACIES GRID ─── */}
                {view === 'pharmacies' && (
                    <div className="space-y-10 animate-in fade-in duration-700">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <span className="text-indigo-600 font-extrabold text-sm tracking-wider uppercase bg-indigo-50 px-4 py-1.5 rounded-full">Gargaar Partners</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Pharmacies</h2>
                            <p className="text-slate-500 max-w-xl mx-auto">Select a pharmacy to view available products and prices.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pharmaciesWithProducts.map((pharmacy, index) => (
                                <div 
                                    key={pharmacy._id}
                                    onClick={() => { 
                                        setSelectedPharmacy(pharmacy); 
                                        setView('products'); 
                                    }}
                                    className="group bg-white/80 backdrop-blur-xl rounded-[28px] border border-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-400 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full pointer-events-none -z-10 transition-transform group-hover:scale-110"></div>
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            {pharmacy.image ? (
                                                <img 
                                                    src={pharmacy.image} 
                                                    alt={pharmacy.name} 
                                                    className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100"
                                                />
                                            ) : (
                                                <div className={`w-16 h-16 bg-gradient-to-br ${getBgGradient(index)} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md`}>
                                                    {getInitials(pharmacy.name)}
                                                </div>
                                            )}
                                            
                                            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${!pharmacy.isClosed ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/50' : 'bg-rose-50/80 text-rose-600 border border-rose-100/50'}`}>
                                                {!pharmacy.isClosed ? 'Open' : 'Closed'}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{pharmacy.name}</h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-2 line-clamp-1">
                                            <MapPin size={16} className="text-slate-400 shrink-0" /> 
                                            <span className="truncate">{pharmacy.locationText || 'No Address Provided'}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100/60">
                                        <div className="flex items-center gap-1.5">
                                            <Star size={16} className="fill-amber-400 text-amber-400" />
                                            <span className="text-sm font-bold text-slate-800">4.9</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── VIEW 2: PHARMACY DETAILS & PRODUCTS ─── */}
                {view === 'products' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        <button 
                            onClick={() => setView('pharmacies')}
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm w-fit hover:shadow-md"
                        >
                            <ArrowLeft size={16} /> Back to Pharmacies
                        </button>

                        {/* MODERN PHARMACY BANNER */}
                        <div className="relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                                {selectedPharmacy?.image ? (
                                    <img 
                                        src={selectedPharmacy.image} 
                                        alt={selectedPharmacy.name} 
                                        className="w-28 h-28 rounded-[28px] object-cover shadow-lg ring-4 ring-white border border-slate-50"
                                    />
                                ) : (
                                    <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] flex items-center justify-center text-white font-black text-4xl shadow-lg ring-4 ring-white">
                                        {getInitials(selectedPharmacy?.name)}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{selectedPharmacy?.name}</h2>
                                        <CheckCircle2 size={24} className="text-emerald-500" />
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                                            <MapPin size={16} className="text-indigo-500" />
                                            <span>{selectedPharmacy?.locationText || 'No Address Provided'}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                                            <Phone size={16} className="text-indigo-500" />
                                            <span dir="ltr">{selectedPharmacy?.contactNumber || 'No Phone Provided'}</span>
                                        </div>

                                        {selectedPharmacy?.whatsappNumber && (
                                            <div className="flex items-center gap-2 bg-emerald-50/80 px-4 py-2 rounded-xl border border-emerald-200/50 backdrop-blur-sm text-emerald-800">
                                                <MessageCircle size={16} className="text-emerald-600" />
                                                <span dir="ltr">{selectedPharmacy?.whatsappNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-xl shadow-slate-900/10 relative z-10 shrink-0">
                                <div className="bg-white/10 p-3 rounded-xl">
                                    <ShoppingBag size={24} className="text-indigo-300" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Available</p>
                                    <span className="text-2xl font-black">{activeProducts.length} Items</span>
                                </div>
                            </div>
                        </div>

                        {/* PRODUCTS GRID */}
                        <div className="pt-6">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                Pharmacy Products
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{activeProducts.length}</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                                {activeProducts.map((product) => {
                                    // 1. Hubi haddii taariikhdu dhamaatay (Expired)
                                    const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;
                                    
                                    // 2. Daawadu waxay haysataa stock haddii tiradu ka weyn tahay 0, isla markaana aysan dhicin
                                    const hasStock = product.quantity > 0 && !isExpired;

                                    return (
                                        <div 
                                            key={product._id}
                                            className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-400 flex flex-col h-[380px] group relative overflow-hidden"
                                        >
                                            {/* IMAGE CONTAINER */}
                                            <div className="bg-[#f8fafc] rounded-[18px] p-4 flex items-center justify-center h-40 relative overflow-hidden group-hover:bg-indigo-50/30 transition-colors shrink-0">
                                                <img 
                                                    src={product.image || "https://via.placeholder.com/150"} 
                                                    alt={product.name} 
                                                    className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ${hasStock ? 'group-hover:scale-105' : 'opacity-40 grayscale'}`}
                                                />
                                                
                                                <div className={`absolute top-3 right-3 backdrop-blur-md border shadow-sm px-2.5 py-1 rounded-lg flex items-center gap-1 ${hasStock ? 'bg-emerald-50/90 border-emerald-200/50 text-emerald-700' : 'bg-rose-50/90 border-rose-200/50 text-rose-700'}`}>
                                                    <Package size={12} />
                                                    <span className="text-[10px] font-bold">
                                                        {isExpired ? 'Expired' : hasStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* STATIC DETAILS (ALWAYS VISIBLE) */}
                                            <div className="mt-4 flex flex-col flex-grow">
                                                <span className="inline-block text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest mb-2 border border-indigo-100/30 w-fit">
                                                    {product.category || 'Medicine'}
                                                </span>
                                                <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-1" title={product.name}>
                                                    {product.name}
                                                </h4>
                                                
                                                {/* Price block at the bottom of static view */}
                                                <div className="mt-auto pt-2">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Price</span>
                                                    <span className="text-xl font-black text-slate-900">{currencySymbol}{product.price?.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* 🚀 HOVER PANEL: SLIDES UP SMOOTHLY ON HOVER */}
                                            <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-100 flex flex-col justify-between h-[175px] transform translate-y-full group-hover:translate-y-0 transition-transform duration-350 ease-in-out shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                                                
                                                {/* Description Section (Scrollable if too long) */}
                                                <div className="overflow-y-auto pr-1 max-h-[80px] scrollbar-thin">
                                                    <p className="text-slate-600 text-xs flex items-start gap-1.5 leading-relaxed">
                                                        <Activity size={12} className="text-indigo-500 shrink-0 mt-0.5" /> 
                                                        <span>{product.description || 'No additional details available'}</span>
                                                    </p>
                                                </div>
                                                
                                                {/* Action Footer inside Hover view */}
                                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Price</span>
                                                        <span className="text-lg font-black text-indigo-600">{currencySymbol}{product.price?.toFixed(2)}</span>
                                                    </div>
                                                    
                                                    <button 
                                                        disabled={!hasStock}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!hasStock) return;
                                                            
                                                            if (addToCart) {
                                                                addToCart(product._id);
                                                                toast.success('Added to cart!');
                                                                navigate('/cart'); 
                                                            } else if (updateCartQuantity) {
                                                                const currentQty = cartItems?.[product._id] || 0;
                                                                updateCartQuantity(product._id, currentQty + 1);
                                                                toast.success('Added to cart!');
                                                                navigate('/cart'); 
                                                            } else {
                                                                toast.error('Unable to add item to cart.');
                                                            }
                                                        }}
                                                        className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all duration-300 group/btn shrink-0 ${hasStock ? 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                                    >
                                                        <ShoppingBag size={14} className={hasStock ? 'group-hover/btn:-translate-y-0.5 transition-transform' : ''} />
                                                        {isExpired ? 'Expired' : hasStock ? 'Order Now' : 'Unavailable'}
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            {activeProducts.length === 0 && (
                                <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[32px] border border-slate-200 border-dashed">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <Package size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Products Found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">Currently, there are no products added to this pharmacy in the system.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyShowcase;