import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, HeartHandshake, ArrowLeft } from 'lucide-react';

const PharmacyInvoice = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.orderData;

    if (!orderData) {
        return (
            <div className="p-8 text-center max-w-md mx-auto mt-20">
                <p className="text-slate-600 mb-4">Xogta Invoice-ka lama helin.</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                    <ArrowLeft size={16} /> Ku laabo Dalabaadka
                </button>
            </div>
        );
    }

    const formattedDate = new Date(orderData.createdAt || Date.now()).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });

    return (
        <div className="p-4 sm:p-8 w-full max-w-4xl mx-auto">
            {/* 🚀 XALKA DHAMMAYSTIRAN EE PRINT-KA 🚀 */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* 1. Qari gabi ahaanba dhammaan web-ka (Sidebar, Navbar, Backgrounds) */
                    body * {
                        visibility: hidden;
                    }
                    
                    /* 2. Soo muuji oo kaliya qaybta Invoice-ka iyo waxa ku dhex jira */
                    #gargaar-invoice-print-area, #gargaar-invoice-print-area * {
                        visibility: visible;
                    }

                    /* 3. Invoice-ka kasoo bixi dhexda layout-ka, oo dusha sare ee warqadda soo saar */
                    #gargaar-invoice-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 20px !important; /* Xoogaa neefsi ah si uusan xuduuda ugu dhagin */
                        border: none !important;
                        box-shadow: none !important;
                    }

                    /* 4. Tirtir margins-ka ay bixiyaan daabacayaasha (Printers) si uusan u noqon 2 page */
                    @page {
                        size: auto;
                        margin: 0;
                    }
                }
            `}} />

            {/* Control Buttons */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => window.print()} 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div>

            {/* Printable Invoice Card */}
            <div id="gargaar-invoice-print-area" className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm print:border-none print:shadow-none print:rounded-none">
                
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-8 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white print:bg-blue-600 print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            <HeartHandshake size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-blue-600">Gargaar</h1>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Health Book Service and Delivery</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Invoice</h2>
                        <p className="text-sm font-bold text-slate-600 mt-1">
                            Invoice No: #INV-{orderData._id ? orderData._id.slice(-6).toUpperCase() : 'BD4319'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Date: {formattedDate}</p>
                    </div>
                </div>

                {/* Billed To & Pharmacy Contact */}
                <div className="grid grid-cols-2 gap-8 my-8 text-sm">
                    <div>
                        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-2">Billed To:</h4>
                        <p className="font-bold text-slate-800 text-base">{orderData.userId?.name || 'Unknown Patient'}</p>
                        <p className="text-slate-500 mt-1">{orderData.address?.city || 'Hargeisa'}</p>
                        <p className="text-slate-500">{orderData.address?.phone || orderData.address?.phoneNumber}</p>
                    </div>
                    <div className="text-right">
                        <h4 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-2">Pharmacy Details:</h4>
                        <p className="font-bold text-slate-800 text-base">{orderData.pharmacyId?.name || "Alla Aamin Pharmacy"}</p>
                        <p className="text-slate-500 mt-1">{orderData.pharmacyId?.phone || "0637369206"}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-b">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b text-xs uppercase tracking-wider">
                                <th className="px-4 py-3">Medicine/Item</th>
                                <th className="px-4 py-3 text-center">Qty</th>
                                <th className="px-4 py-3 text-right">Unit Price</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-600">
                            {orderData.items && orderData.items.map((item, index) => {
                                const qty = item.quantity || 1;
                                const price = item.price || item.medicineId?.price || 0;
                                const total = qty * price;
                                return (
                                    <tr key={index}>
                                        <td className="px-4 py-4 font-semibold text-slate-800">
                                            {item.name || item.medicineId?.name || 'Medicine'}
                                        </td>
                                        <td className="px-4 py-4 text-center font-medium">
                                            {qty} {qty > 1 ? 'items' : 'item'}
                                        </td>
                                        <td className="px-4 py-4 text-right">${price.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-800">${total.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Calculation Summary */}
                <div className="flex justify-end mt-6 text-sm">
                    <div className="w-full sm:w-64 space-y-3 font-medium">
                        <div className="flex justify-between text-slate-500">
                            <span>Sub Total:</span>
                            <span>${(orderData.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Tax (0%):</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-slate-800 font-bold text-base border-t pt-3">
                            <span>Grand Total:</span>
                            <span>${(orderData.totalAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyInvoice;