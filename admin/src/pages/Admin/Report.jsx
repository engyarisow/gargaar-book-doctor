import React, { useState, useContext } from 'react';
import { 
  Search, Printer, Calendar, DollarSign, Users, HeartHandshake, 
  FileText, CheckCircle2, Clock, XCircle, Package, Loader2 
} from 'lucide-react';
import { AdminContext } from '../../context/AdminContext'; // Hubi in path-gani sax yahay

const AdminReportDashboard = () => {
  const { getSystemReport, systemReportData, isReportLoading } = useContext(AdminContext);

  const [activeTab, setActiveTab] = useState('doctor');
  const [searchId, setSearchId] = useState('');

  const tabs = [
    { id: 'doctor', name: 'Doctor' },
    { id: 'hospital', name: 'Hospital' },
    { id: 'user', name: 'Patient' },
    { id: 'pharmacy', name: 'Pharmacy' },
  ];

  const formattedDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const getCategoryName = () => {
    return tabs.find(t => t.id === activeTab)?.name || 'Unknown';
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      getSystemReport(activeTab, searchId);
    }
  };

  // Marka la bedelo tab-ka, in la tirtiro xogta hore si aysan isku dhex yaacin
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchId('');
  };

  return (
    <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto bg-slate-50 min-h-screen print:bg-white print:min-h-0 print:p-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
            @page { size: A4; margin: 0.5cm; }
            body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .print\\:hidden { display: none !important; }
            #gargaar-report-print-area { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}} />

      {/* Control Section */}
      <div className="print:hidden mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">System Reports</h1>
            <p className="text-slate-500 text-sm mt-1">Generate and view performance reports for Gargaar.</p>
          </div>
          <button 
            onClick={() => window.print()} 
            disabled={!systemReportData}
            className={`flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all ${
              systemReportData ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Printer size={18} /> Print Report
          </button>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-2 justify-between">
          <div className="flex space-x-1 overflow-x-auto p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-1">
            <div className="relative min-w-[250px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${getCategoryName()} ID...`}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isReportLoading || !searchId}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all disabled:bg-blue-300"
            >
              {isReportLoading ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isReportLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500 font-medium">Generating Report...</p>
        </div>
      )}

      {/* Empty State */}
      {!isReportLoading && !systemReportData && (
        <div className="bg-white border border-slate-200 rounded-[2rem] py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Report Generated Yet</h3>
          <p className="text-slate-500 max-w-sm">
            Enter a {getCategoryName()} ID in the search box above to generate a performance report.
          </p>
        </div>
      )}

      {/* Print Area / Dashboard Result */}
      {!isReportLoading && systemReportData && (
        <div id="gargaar-report-print-area" className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-100 shadow-sm print:rounded-none">
            
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-slate-200/80 gap-6">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <HeartHandshake size={30} strokeWidth={2.5} />
                  </div>
                  <div>
                      <h1 className="text-3xl font-black text-blue-600 tracking-tight">Gargaar</h1>
                      <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Health & Medical Services</p>
                  </div>
              </div>
              <div className="text-left sm:text-right">
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">System Report</h2>
                  <p className="text-sm font-bold text-slate-500 mt-2 flex items-center justify-start sm:justify-end gap-2">
                      <FileText size={16} /> 
                      <span>#RPT-{Math.floor(Math.random() * 90000) + 10000}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Generated: {formattedDate}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-10 px-6 py-8 bg-slate-50/50 rounded-2xl border border-slate-100/50">
              <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                      <Users size={14} /> Category
                  </h4>
                  <p className="font-black text-slate-800 text-xl">{getCategoryName()}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active Status
                  </div>
              </div>
              <div className="sm:text-right">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] mb-2">Target ID</h4>
                  <p className="font-black text-blue-600 text-2xl">{searchId || 'N/A'}</p>
                  <p className="text-slate-500 text-xs mt-2 font-medium">Requested By: System Administrator</p>
              </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-600 rounded-full inline-block"></span>
              Performance Analytics
            </h3>
            
            {activeTab === 'doctor' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <StatCard title="Total Revenue" value={`$${systemReportData?.revenue || 0}`} icon={<DollarSign size={24}/>} theme="emerald" />
                  <StatCard title="Total Appointments" value={systemReportData?.totalAppointments || 0} icon={<Calendar size={24}/>} theme="blue" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <StatusTable title="Video Consultations" 
                    completed={systemReportData?.videoConsultations?.completed || 0} 
                    pending={systemReportData?.videoConsultations?.pending || 0} 
                    cancelled={systemReportData?.videoConsultations?.cancelled || 0} 
                  />
                  <StatusTable title="Physical Appointments" 
                    completed={systemReportData?.physicalAppointments?.completed || 0} 
                    pending={systemReportData?.physicalAppointments?.pending || 0} 
                    cancelled={systemReportData?.physicalAppointments?.cancelled || 0} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'hospital' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <StatCard title="Total Revenue" value={`$${systemReportData?.revenue || 0}`} icon={<DollarSign size={24}/>} theme="emerald" />
                  <StatCard title="Active Doctors" value={systemReportData?.activeDoctors || 0} icon={<Users size={24}/>} theme="purple" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <StatusTable title="Hospital Appointments" 
                    completed={systemReportData?.hospitalAppointments?.completed || 0} 
                    pending={systemReportData?.hospitalAppointments?.pending || 0} 
                    cancelled={systemReportData?.hospitalAppointments?.cancelled || 0} 
                  />
                  <StatusTable title="Video Consultations" 
                    completed={systemReportData?.videoConsultations?.completed || 0} 
                    pending={systemReportData?.videoConsultations?.pending || 0} 
                    cancelled={systemReportData?.videoConsultations?.cancelled || 0} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'user' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <StatusTable title="Doctor Appointments" 
                  completed={systemReportData?.doctorAppointments?.completed || 0} 
                  pending={systemReportData?.doctorAppointments?.pending || 0} 
                  cancelled={systemReportData?.doctorAppointments?.cancelled || 0} 
                />
                <StatusTable title="Video Consultations" 
                  completed={systemReportData?.videoConsultations?.completed || 0} 
                  pending={systemReportData?.videoConsultations?.pending || 0} 
                  cancelled={systemReportData?.videoConsultations?.cancelled || 0} 
                />
                <StatusTable title="Pharmacy Orders" 
                  completed={systemReportData?.pharmacyOrders?.completed || 0} 
                  pending={systemReportData?.pharmacyOrders?.pending || 0} 
                  cancelled={systemReportData?.pharmacyOrders?.cancelled || 0} 
                />
              </div>
            )}

            {activeTab === 'pharmacy' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <StatCard title="Total Revenue" value={`$${systemReportData?.revenue || 0}`} icon={<DollarSign size={24}/>} theme="emerald" />
                  <StatCard title="Total Orders" value={systemReportData?.totalOrders || 0} icon={<Package size={24}/>} theme="blue" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <StatusTable title="Pharmacy Orders" 
                    completed={systemReportData?.pharmacyOrders?.completed || 0} 
                    pending={systemReportData?.pharmacyOrders?.pending || 0} 
                    cancelled={systemReportData?.pharmacyOrders?.cancelled || 0} 
                    completedLabel="Delivered" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  This is a computer-generated report and does not require a signature.
              </p>
              <p className="text-[10px] text-slate-400 mt-2">© {new Date().getFullYear()} Gargaar Health Management System.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, theme }) => {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };
  const selectedTheme = themes[theme] || themes.blue;
  return (
    <div className={`p-6 rounded-2xl border flex items-center gap-5 bg-white shadow-sm`}>
      <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center ${selectedTheme}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const StatusTable = ({ title, completed, pending, cancelled, completedLabel = "Completed" }) => (
  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm flex-1">
    <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200">
      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest">{title}</h4>
    </div>
    <div className="divide-y divide-slate-100/80">
      <StatusRow label={completedLabel} value={completed} icon={<CheckCircle2 size={16} />} color="text-emerald-600" />
      <StatusRow label="Pending" value={pending} icon={<Clock size={16} />} color="text-amber-500" />
      <StatusRow label="Cancelled" value={cancelled} icon={<XCircle size={16} />} color="text-rose-500" />
    </div>
  </div>
);

const StatusRow = ({ label, value, icon, color }) => (
  <div className="flex justify-between items-center px-5 py-4 bg-white">
    <div className="flex items-center gap-3">
      <span className={color}>{icon}</span>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </div>
    <span className={`text-base font-black ${color}`}>{value}</span>
  </div>
);

export default AdminReportDashboard;