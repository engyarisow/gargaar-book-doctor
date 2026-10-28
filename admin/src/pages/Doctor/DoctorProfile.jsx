import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, updateProfileData } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  // Toggle state for Edit Mode
  const [isEdit, setIsEdit] = useState(false);

  // Local state to store edits before saving to backend
  const [formData, setFormData] = useState({
    fees: "",
    address: { line1: "", line2: "" },
    available: false,
    about: ""
  });

  // Sync local form state when backend data loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        fees: profileData.fees || "",
        address: { 
          line1: profileData.address?.line1 || profileData.address?.Line1 || "", 
          line2: profileData.address?.line2 || profileData.address?.Line2 || "" 
        },
        available: profileData.available || false,
        about: profileData.about || ""
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const handleSave = async () => {
    const success = await updateProfileData(formData);
    if (success) {
      setIsEdit(false);
      getProfileData(); // Refresh component data
    }
  };

  // Status Badge styling helper 
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "Rejected": return "bg-rose-50 border-rose-200 text-rose-700";
      default: return "bg-amber-50 border-amber-200 text-amber-700";
    }
  };

  // Check if profile belongs to an institutional layout (hospital or clinic)
  const isOwnershipLocked = profileData?.ownerType === "hospital" || profileData?.ownerType === "clinic";

  return (
    profileData && (
      <div className="p-6 max-w-5xl mx-auto bg-slate-50/50 min-h-screen rounded-2xl fallback-font">
        {/* Header Breadcrumb Banner */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctor Profile</h1>
            <p className="text-sm text-slate-500">Maamul macluumaadkaaga guud iyo helitaanka</p>
          </div>
          
          {/* Action Button */}
          <button
            onClick={isEdit ? handleSave : () => setIsEdit(true)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm flex items-center gap-2 ${
              isEdit
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
            }`}
          >
            {isEdit ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Save Changes
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Image Card & Quick Status */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <img
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                src={profileData.image}
                alt={profileData.name}
              />
              <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${formData.available ? 'bg-emerald-500' : 'bg-rose-400'}`}></span>
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">{profileData.name}</h2>
            
            <p className="text-indigo-600 font-medium text-sm px-3 py-1 bg-indigo-50/60 rounded-full mt-1">
              {profileData.speciality}
            </p>

            {/* Direct Subheader Display for Organization Workspace */}
            {isOwnershipLocked && (
              <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center justify-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                {profileData.ownerType === 'hospital' ? '🏥' : '⚕️'} {profileData.addedBy?.name || 'Authorized Institution'}
              </p>
            )}

            <p className="text-xs text-slate-400 mt-2">{profileData.degree}</p>
            
            <p className="text-xs text-slate-500 font-medium mt-1 select-all">{profileData.email}</p>

            <hr className="w-full my-5 border-slate-100" />

            {/* Account Status Meta Rows */}
            <div className="w-full space-y-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider"> Status</span>
                <span className={`px-2 py-0.5 border rounded-md font-medium text-[11px] ${getStatusBadgeClass(profileData.status)}`}>
                  {profileData.status || "Pending"}
                </span>
              </div>
              
              {/* Workspace Layout */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Work</span>
                {profileData.ownerType === 'hospital' ? (
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-md font-medium text-[11px] truncate max-w-[140px]">
                    🏥 {profileData.addedBy?.name || 'Hospital'}
                  </span>
                ) : profileData.ownerType === 'clinic' ? (
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-medium text-[11px] truncate max-w-[140px]">
                    ⚕️ {profileData.addedBy?.name || 'Clinic'}
                  </span>
                ) : (
                  <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    👤 Freelancer
                  </span>
                )}
              </div>
            </div>

            {/* Quick Status Dynamic Form Control */}
            <div className="w-full flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Availability Status</span>
                {/* Fixed: Removed the lock condition. Doctor can toggle this anytime in edit mode */}
                <button
                  disabled={!isEdit}
                  onClick={() => setFormData(prev => ({ ...prev, available: !prev.available }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    !isEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  } ${formData.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.available ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Inputs */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Biography Section */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">About</h3>
              {isEdit ? (
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50"
                  rows="4"
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                />
              ) : (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{formData.about || "No professional overview available."}</p>
              )}
            </div>

            {/* Professional Settings */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Consultation Fees Container */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"> Fee</label>
                {isEdit ? (
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-sm font-semibold">{currency}</span>
                    </div>
                    <input
                      type="number"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50 font-medium"
                      value={formData.fees}
                      onChange={(e) => setFormData(prev => ({ ...prev, fees: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="text-lg font-bold text-slate-800">
                    {currency} {formData.fees}
                  </div>
                )}
              </div>

              {/* Static Experience Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience</label>
                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {profileData.experience}  
                </div>
              </div>

              {/* Address Container Layout */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                {isEdit ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Street line 1"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50"
                      value={formData.address.line1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    />
                    <input
                      type="text"
                      placeholder="Suite / Suite number (Line 2)"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-slate-50/50"
                      value={formData.address.line2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                    />
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 space-y-0.5">
                    <p className="font-medium text-slate-700">{formData.address.line1 || "No Street Location Added"}</p>
                    {formData.address.line2 && <p>{formData.address.line2}</p>}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;