import React, { useState } from 'react';
import { 
    Wallet, DollarSign, CheckCircle, Clock, Building2, Smartphone, 
    Send, ArrowRight, AlertCircle, Hospital, Stethoscope, Pill, Filter 
} from 'lucide-react';

const AdminPayouts = () => {
    // State-yada Filters-ka iyo Form-ka
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [adminSenderAccount, setAdminSenderAccount] = useState('Telesom Zaad HQ (639201)');
    const [vendorFilter, setVendorFilter] = useState('all'); // 'all', 'pharmacy', 'hospital', 'doctor'

    // Xogta Guud ee Sanduuqa Admin-ka (Platform Global Overview)
    const adminStats = {
        totalPendingPayouts: "$3,225.00",
        totalPlatformCommission: "$12,450.00",
        totalSettledAll: "$185,000.00",
    };

    // 1. ALL COMING PAGE DATA: Dalabaadka hadda soo xarooday ee qayb kasta leh
    const [pendingRequests, setPendingRequests] = useState([
        { id: 'REQ-901', name: 'Shaafi Pharmacy', type: 'pharmacy', date: 'Today, 02:15 PM', amount: '$500.00', method: 'ZAAD Service', accountNumber: 'MER-84021' },
        { id: 'REQ-905', name: 'Medline Hospital', type: 'hospital', date: 'Today, 04:30 PM', amount: '$2,350.00', method: 'EVC Plus', accountNumber: '0617888888' },
        { id: 'REQ-899', name: 'Dr. Ahmed (Neurologist)', type: 'doctor', date: 'Yesterday', amount: '$375.00', method: 'eDahab', accountNumber: 'ED-9921' },
        { id: 'REQ-915', name: 'Geeska Pharmacy', type: 'pharmacy', date: '2 days ago', amount: '$420.00', method: 'ZAAD Service', accountNumber: 'MER-77120' },
    ]);

    // 2. ALL PAID PAGE DATA: Taariikhda lacagihii horay u baxay ee guul weyn ku dhammaaday
    const [disbursedHistory, setDisbursedHistory] = useState([
        { id: 'PAY-8402', name: 'Karan Hospital', type: 'hospital', date: 'June 10, 2026', amount: '$4,500.00', method: 'ZAAD Service', accountNumber: 'MER-33921', txnId: 'TXN-ZAAD-9938210A' },
        { id: 'PAY-8391', name: 'Oda Pharmacy', type: 'pharmacy', date: 'June 03, 2026', amount: '$1,800.00', method: 'EVC Plus', accountNumber: '0615999999', txnId: 'EVC-749201-920' },
        { id: 'PAY-8210', name: 'Dr. Fatima (Pediatrician)', type: 'doctor', date: 'May 28, 2026', amount: '$950.00', method: 'eDahab', accountNumber: 'ED-4402', txnId: 'DHB-883921-X' }
    ]);

    // Function-ka lagu bixinayo lacagta
    const handleConfirmPayout = (e) => {
        e.preventDefault();
        if (!transactionId) return alert("Fadlan geli Transaction ID-ga rasmiga ah!");

        setPendingRequests(pendingRequests.filter(req => req.id !== selectedRequest.id));

        const newHistoryLog = {
            id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
            name: selectedRequest.name,
            type: selectedRequest.type,
            date: 'Just Now',
            amount: selectedRequest.amount,
            method: selectedRequest.method,
            accountNumber: selectedRequest.accountNumber,
            txnId: transactionId
        };

        setDisbursedHistory([newHistoryLog, ...disbursedHistory]);
        setSelectedRequest(null);
        setTransactionId('');
    };

    // Helper u fura Icon-ka ku habboon adeeg bixiyaha
    const renderVendorBadge = (type) => {
        switch(type) {
            case 'hospital':
                return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg text-xs font-bold"><Hospital size={12}/> Hospital</span>;
            case 'doctor':
                return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-bold"><Stethoscope size={12}/> Doctor</span>;
            default:
                return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-lg text-xs font-bold"><Pill size={12}/> Pharmacy</span>;
        }
    };

    // Sifaynta xogta iyadoo loo eegayo nooca la doortay
    const filteredPending = pendingRequests.filter(r => vendorFilter === 'all' || r.type === vendorFilter);
    const filteredPaid = disbursedHistory.filter(h => vendorFilter === 'all' || h.type === vendorFilter);

    return (
        <div className="p-4 sm:p-8 w-full bg-slate-50 min-h-screen font-sans">
            
            {/* Header */}
            <div className="mb-8 border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finances & Payouts</h2>
                    <p className="text-slate-500 mt-1 text-sm">Maamul lacagaha loo dirayo Cusbitaalada, Dhaqaatiirta, iyo Farmashiyayasha.</p>
                </div>
                
                {/* Global Filter Buttons */}
                <div className="flex flex-wrap gap-2 bg-slate-200/60 p-1.5 rounded-2xl w-fit border border-slate-200">
                    {['all', 'pharmacy', 'hospital', 'doctor'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setVendorFilter(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${
                                vendorFilter === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {type === 'all' ? 'All Providers' : `${type}s`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dashboard Counter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">All Coming (Pending Requests)</p>
                        <h3 className="text-2xl font-black text-orange-600">{adminStats.totalPendingPayouts}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Clock size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Platform Total Earnings</p>
                        <h3 className="text-2xl font-black text-blue-600">{adminStats.totalPlatformCommission}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">All Paid (Total Settled)</p>
                        <h3 className="text-2xl font-black text-emerald-600">{adminStats.totalSettledAll}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24}/></div>
                </div>
            </div>

            {/* Content Core Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* TAB 1: ALL COMING SECTION */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-black text-slate-900">All Coming Requests</h3>
                                <p className="text-xs text-slate-500">Codsiyada lacag bixineed ee hadda safka ku jira.</p>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg font-mono">
                                {filteredPending.length} Open
                            </span>
                        </div>

                        {filteredPending.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 space-y-2">
                                <AlertCircle className="mx-auto text-slate-300" size={32} />
                                <p className="text-sm font-medium">Ma jiraan dalabaad furan oo qaybtan ah.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredPending.map((req) => (
                                    <div key={req.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${selectedRequest?.id === req.id ? 'bg-slate-50 border-l-4 border-l-slate-900' : ''}`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-extrabold text-slate-900 text-base">{req.name}</h4>
                                                {renderVendorBadge(req.type)}
                                            </div>
                                            <p className="text-xs text-slate-400">{req.date} • Dest: <strong className="text-slate-600 font-mono">{req.method} ({req.accountNumber})</strong></p>
                                        </div>
                                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                                            <span className="text-lg font-black text-slate-950">{req.amount}</span>
                                            <button 
                                                onClick={() => setSelectedRequest(req)}
                                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1">
                                                Process <ArrowRight size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TAB 2: ALL PAID SECTION */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                            <h3 className="text-base font-black text-slate-900">All Paid History</h3>
                            <p className="text-xs text-slate-500">Diiwaanka lacagaha si guul leh loo bixiyey.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-400 font-bold border-b text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Provider Name</th>
                                        <th className="px-6 py-3.5">Amount Sent</th>
                                        <th className="px-6 py-3.5">Account Details</th>
                                        <th className="px-6 py-3.5 font-mono text-blue-600">Network Txn ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {filteredPaid.map((history) => (
                                        <tr key={history.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-bold text-slate-900">{history.name}</p>
                                                    <div>{renderVendorBadge(history.type)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900 text-base">{history.amount}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800 text-xs">{history.method}</p>
                                                <p className="text-xs font-mono text-slate-400">{history.accountNumber}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-emerald-50 text-emerald-800 font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-emerald-100">
                                                    {history.txnId}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* DISBURSEMENT FORM (SIDE PANEL) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Disburse Funds</h3>
                        <p className="text-xs text-slate-400 mt-0.5">U xawil lacagta si toos ah adeeg bixiyaha.</p>
                    </div>

                    {!selectedRequest ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-4">
                            <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                            <p className="text-xs font-bold text-slate-400">Dooro dalab ka mid ah "All Coming Requests" si aad u hawlgasho.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleConfirmPayout} className="space-y-5">
                            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                                <div className="flex justify-between items-center">
                                    {renderVendorBadge(selectedRequest.type)}
                                    <span className="text-xl font-black text-emerald-400">{selectedRequest.amount}</span>
                                </div>
                                <h4 className="text-sm font-black pt-1">{selectedRequest.name}</h4>
                                <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                                    {selectedRequest.method}: {selectedRequest.accountNumber}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sending Wallet Source</label>
                                <select 
                                    value={adminSenderAccount}
                                    onChange={(e) => setAdminSenderAccount(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-slate-900 transition-all">
                                    <option value="Telesom Zaad HQ (639201)">Zaad HQ Account (639201)</option>
                                    <option value="Hormuud Merchant (859402)">EVC Plus Merchant (859402)</option>
                                    <option value="Somtel eDahab Main (10492)">eDahab Main Bulk (10492)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Official Transaction ID</label>
                                <input 
                                    type="text"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Geli Txn ID-ga rasmiga ah"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs outline-none focus:bg-white focus:border-slate-900 transition-all"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setSelectedRequest(null)} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                                    <Send size={12}/> Confirm Transfer
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminPayouts;