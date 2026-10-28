import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { CheckCircle2, XCircle, Loader2, Receipt, ArrowRight, Home, ShieldAlert, Mail } from 'lucide-react';

const VerifyOrder = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const session_id = searchParams.get("session_id");
    const order_token = searchParams.get("order_token");

    const { backendUrl, token: contextToken } = useContext(AppContext);
    const navigate = useNavigate();

    // State-ka xakameynaya waxa shaashadda kasoo baxaya ('verifying', 'success', 'failed')
    const [paymentStatus, setPaymentStatus] = useState('verifying');
    const [statusMessage, setStatusMessage] = useState('Fadlan sug, waxaan hubinaynaa lacag bixintaada...');

    useEffect(() => {
        const verifyPayment = async () => {
            const userToken = contextToken || localStorage.getItem('token');

            if (!userToken) {
                setStatusMessage('Waxaan sugeynaa aqoonsigaaga (Token)...');
                return;
            }

            // Haddii user-ku uu isagu iska joojiyay (Canceled)
            if (success === "false" || searchParams.get("canceled")) {
                setPaymentStatus('failed');
                setStatusMessage('Lacag bixinta waa la joojiyay ama wey fashilantay.');
                return;
            }

            try {
                const requestData = { success, session_id, order_token };

                const response = await axios.post(
                    `${backendUrl}/api/user/verify-order-stripe`,
                    requestData,
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );

                if (response.data.success) {
                    setPaymentStatus('success');
                    setStatusMessage(response.data.message || 'Lacagta si guul leh ayaa loo bixiyay!');
                } else {
                    setPaymentStatus('failed');
                    setStatusMessage(response.data.message || 'Lacag bixintu way fashilantay. Fadlan dib isku day.');
                }
            } catch (error) {
                console.error("Verification Error:", error);
                setPaymentStatus('failed');
                setStatusMessage(error.response?.data?.message || 'Cilad xagga server-ka ah ayaa dhacday!');
            }
        };

        if ((success && session_id) || searchParams.get("canceled")) {
            verifyPayment();
        } else {
            // Haddii uusan URL-ku lahayn xogta Stripe, dib ugu celi cart-ga
            navigate('/cart');
        }

    }, [success, session_id, order_token, backendUrl, contextToken, navigate, searchParams]);

    // ─── 1. QAYBTA LOADING-KA (VERIFYING) ───
    if (paymentStatus === 'verifying') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#f8fafc] px-4">
                <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center max-w-md w-full text-center">
                    <Loader2 size={48} className="text-indigo-600 animate-spin mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Verifying Payment</h2>
                    <p className="text-slate-500 font-medium">{statusMessage}</p>
                    <div className="mt-8 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                        <ShieldAlert size={18} /> Fadlan ha xirin boggan...
                    </div>
                </div>
            </div>
        );
    }

    // ─── 2. QAYBTA SUCCESS (RECEIPT) ───
    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-[#f8fafc] py-12 px-4 flex items-center justify-center font-sans">
                <div className="max-w-lg w-full bg-white rounded-[32px] shadow-lg border border-slate-200 overflow-hidden relative">
                    
                    {/* Header-ka Receipt-ga */}
                    <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-1">Payment Successful!</h1>
                            <p className="text-emerald-50 font-medium">Thank you for choosing Gargaar Pharmacy.</p>
                        </div>
                    </div>

                    {/* Faahfaahinta Rasiidka */}
                    <div className="p-8">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 border-dashed">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 border-dashed">
                                <Receipt className="text-indigo-600" size={24} />
                                <h3 className="font-bold text-slate-800 text-lg">Order Receipt</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Transaction ID</span>
                                    <span className="font-bold text-slate-800 font-mono text-xs">{session_id?.substring(0, 15)}...</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-bold text-slate-800">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Paid</span>
                                </div>
                            </div>
                        </div>

                        {/* Fariinta Email-ka & PIN-ka */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 mb-8">
                            <div className="mt-1">
                                <Mail className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Check your email</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Waxaan email-kaaga kuugu dirnay <strong>Verification PIN</strong>. Fadlan u dhiib koodhkas qofka daawada kuu keenaya si uu dalabka u xiro.
                                </p>
                            </div>
                        </div>

                        {/* Batoomada */}
                        <div className="flex flex-col gap-3">
                            <Link 
                                to="/my-orders"
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
                            >
                                Track My Order <ArrowRight size={18} />
                            </Link>
                            <Link 
                                to="/"
                                className="w-full bg-white text-slate-700 border border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                            >
                                <Home size={18} /> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── 3. QAYBTA FAILED / CANCELED ───
    if (paymentStatus === 'failed') {
        return (
            <div className="min-h-screen bg-[#f8fafc] py-12 px-4 flex items-center justify-center font-sans">
                <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 text-center">
                    
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={48} className="text-rose-500" />
                    </div>
                    
                    <h1 className="text-3xl font-black text-slate-900 mb-3">Payment Failed!</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {statusMessage} Wax lacag ah lagaama jarin. Fadlan isku day markale ama hubi kaarkaaga.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link 
                            to="/cart"
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors shadow-sm"
                        >
                            Return to Cart <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default VerifyOrder;