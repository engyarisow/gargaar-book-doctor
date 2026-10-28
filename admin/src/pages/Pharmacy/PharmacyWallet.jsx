import React, { useState } from 'react';
import { Wallet, DollarSign, Percent, CheckCircle, Clock, Building2, Smartphone, Send, FileText, X, AlertCircle, RefreshCw } from 'lucide-react';

const PharmacyWallet = () => {
    const [amount, setAmount] = useState('');
    const [selectedPayout, setSelectedPayout] = useState(null);

    // 1. Akoonka Farmashiyaha ee diiwaangashan
    const registeredAccount = {
        method: 'ZAAD Service',
        type: 'Merchant Account',
        accountNumber: 'MER-84021',
    };

    // 2. Kaadhadhka Lacagaha Guud
    const walletData = {
        totalEarnings: "$4,250.00",
        commissionDeducted: "$425.00",
        netBalance: "$825.00", 
        totalPaidOut: "$3,000.00",
    };

    // 3. Dalabaadka Socda
    const [activeRequests, setActiveRequests] = useState([
        { id: 'REQ-901', date: 'Today, 02:15 PM', amount: '$500.00', status: 'Pending Admin', stage: 1 },
        { id: 'REQ-899', date: 'Yesterday', amount: '$325.00', status: 'Processing', stage: 2 }
    ]);

    // 4. Lacagaha horay u dhammaaday
    const completedPayouts = [
        { 
            id: 'PAY-8402', 
            date: 'June 10, 2026', 
            time: '04:30 PM',
            amount: '$1,200.00', 
            method: 'ZAAD Service', 
            recipientNumber: 'MER-84021',
            platformSenderAccount: 'Telesom Zaad HQ (639201)', 
            transactionId: 'TXN-ZAAD-9938210A'
        },
        { 
            id: 'PAY-8391', 
            date: 'June 03, 2026', 
            time: '11:15 AM',
            amount: '$1,800.00', 
            method: 'EVC Plus', 
            recipientNumber: '0615999999',
            platformSenderAccount: 'Hormuud Merchant (859402)', 
            transactionId: 'EVC-749201-920'
        }
    ];

    const handleRequestTransfer = (e) => {
        e.preventDefault();
        if(!amount || amount <= 0) return;

        const newRequest = {
            id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
            date: 'Just now',
            amount: `$${parseFloat(amount).toFixed(2)}`,
            status: 'Pending Admin',
            stage: 1
        };

        setActiveRequests([newRequest, ...activeRequests]);
        setAmount('');
    };

    return (
        <div className="p-4 sm:p-8 w-full bg-slate-50 min-h-screen">
            
            {/* Header / Cinwaanka Bogga */}
            <div className="mb-8 border-b border-slate-200 pb-5">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacy Wallet Dashboard</h2>
                <p className="text-slate-500 mt-1 text-sm">Maamul lacagahaaga, u dir dalab xawilaad Admin-ka, oo la soco mid kasta halka uu u marayo si ammaan ah.</p>
            </div>

            {/* 4-ta Sanduuq ee Xogta Kooban */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Gross Sales</p>
                    <h3 className="text-2xl font-black text-slate-900">{walletData.totalEarnings}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gargaar Commission (10%)</p>
                    <h3 className="text-2xl font-black text-slate-900">{walletData.commissionDeducted}</h3>
                </div>

                <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-100 relative overflow-hidden">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Available for Withdrawal</p>
                    <h3 className="text-2xl font-black">{walletData.netBalance}</h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">Successfully Transferred</p>
                    <h3 className="text-2xl font-black text-emerald-600">{walletData.totalPaidOut}</h3>
                </div>
            </div>

            {/* 3-Column Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. SECTION-KA BIDIX: DALABKA CUSUB & AKOONKA */}
                <div className="space-y-6">
                    {/* Sanduuqa Akoonka rasmiga ah - Halkan waxaa hadda ku jira CheckCircle */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <CheckCircle size={16}/> Payout Destination
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/60">
                            <p className="text-xs text-slate-400">Lacagta waxaa lagugu soo hagaajinayaa:</p>
                            <h4 className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                                {registeredAccount.type === 'Merchant Account' ? <Building2 size={16} className="text-emerald-400" /> : <Smartphone size={16} />} 
                                {registeredAccount.method}
                            </h4>
                            <p className="text-sm font-mono font-bold text-slate-300 mt-2 bg-slate-900/60 px-2.5 py-1 rounded w-fit">
                                ID: {registeredAccount.accountNumber}
                            </p>
                        </div>
                    </div>

                    {/* Foomka Dalabka Lacagta */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-base font-black text-slate-900 mb-1">New Withdrawal Request</h3>
                        <p className="text-xs text-slate-500 mb-4">U dir dalab lacag bixin maamulka platform-ka.</p>
                        
                        <form onSubmit={handleRequestTransfer} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Enter Amount to Request</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                    <input 
                                        type="number" 
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00" 
                                        max="825"
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                                <Send size={14} /> Send Request
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. SECTION-KA DHEXE: TRACK ACTIVE REQUESTS */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
                    <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-black text-slate-900">Active Requests</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Dalabaadkaaga hadda ku jira gacanta Admin-ka.</p>
                        </div>
                        <span className="bg-orange-50 text-orange-600 p-1.5 rounded-lg text-xs font-bold animate-pulse"><RefreshCw size={14}/></span>
                    </div>

                    {activeRequests.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 space-y-1">
                            <AlertCircle className="mx-auto text-slate-300" size={24} />
                            <p className="text-xs font-medium">Weli ma jiro dalab lacag oo furan.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeRequests.map((req, idx) => (
                                <div key={idx} className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded font-mono">{req.id}</span>
                                            <p className="text-[11px] text-slate-400 mt-1">{req.date}</p>
                                        </div>
                                        <p className="text-base font-black text-slate-900">{req.amount}</p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                                            <span className={req.stage >= 1 ? "text-orange-600 font-extrabold" : ""}>1. Admin Review</span>
                                            <span className={req.stage >= 2 ? "text-blue-600 font-extrabold" : ""}>2. Processing</span>
                                            <span>3. Disbursed</span>
                                        </div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${
                                                req.stage === 1 ? 'bg-orange-500 w-1/3' : 'bg-blue-500 w-2/3'
                                            }`}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                                        <Clock size={12} className="text-orange-500" />
                                        <span className="text-slate-600">Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                                            req.status === 'Pending Admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{req.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. SECTION-KA MIDIG: SETTLED PAYOUTS */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-base font-black text-slate-900">Settled Payouts</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Lacagihii si guul leh loogu soo shubay akoonkaaga.</p>
                    </div>

                    <div className="space-y-3">
                        {completedPayouts.map((payout, index) => (
                            <div key={index} className="border border-slate-100 p-3.5 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-all">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <h4 className="font-bold text-slate-900 text-sm">{payout.id}</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{payout.date} • {payout.method}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="font-black text-slate-900 text-sm">{payout.amount}</span>
                                    <button 
                                        onClick={() => setSelectedPayout(payout)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors">
                                        <FileText size={12}/> Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* DIGITAL RECEIPT MODAL */}
            {selectedPayout && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                        <div className="bg-emerald-500 p-6 text-center text-white relative">
                            <button onClick={() => setSelectedPayout(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-1 rounded-full transition-all">
                                <X size={18}/>
                            </button>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle size={24} className="text-emerald-500" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-wider opacity-90">Transfer Successful</h2>
                            <h1 className="text-3xl font-black mt-0.5">{selectedPayout.amount}</h1>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-slate-400 font-medium">Date & Time</span>
                                <span className="font-bold text-slate-800 text-right">{selectedPayout.date}<br/>{selectedPayout.time}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-slate-400 font-medium">Sender Source</span>
                                <span className="font-bold text-slate-800">{selectedPayout.platformSenderAccount}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                                <span className="text-slate-400 font-medium">Destination Route</span>
                                <span className="font-bold text-slate-800 text-right">{selectedPayout.method}<br/>({selectedPayout.recipientNumber})</span>
                            </div>

                            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Network Transaction ID</p>
                                <p className="text-lg font-mono font-black text-slate-900 select-all tracking-wide">
                                    {selectedPayout.transactionId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PharmacyWallet;