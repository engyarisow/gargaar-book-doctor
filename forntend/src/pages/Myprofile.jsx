import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { userData, setUserData, updateUserProfile } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  if (!userData) return null;

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone || '');
      formData.append('address', JSON.stringify(userData.address || {}));
      formData.append('gender', userData.gender || '');
      formData.append('dob', userData.dob || '');
      if (image) formData.append('image', image);

      await updateUserProfile(formData);
      setIsEdit(false);
      setImage(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans selection:bg-blue-200">
      
      {/* 1. Cover Photo / Banner (Health & Patient Theme) */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden bg-blue-900">
        {/* Medical/Health Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80" 
          alt="Healthcare Cover" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* Subtle Blue/Teal Gradient Overlay for modern medical look */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/50 to-teal-500/30 mix-blend-multiply"></div>
        {/* Bottom shadow gradient to blend with the profile card */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* 2. Top Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-white/60 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            
            {/* Avatar & Name Section */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto -mt-20 md:-mt-16">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-2xl ring-1 ring-slate-100">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {image ? (
                      <img className="w-full h-full object-cover" src={URL.createObjectURL(image)} alt="Profile" />
                    ) : userData.image ? (
                      <img className="w-full h-full object-cover" src={userData.image} alt="Profile" />
                    ) : (
                      <span className="text-6xl font-bold text-blue-600">{userData.name?.[0]}</span>
                    )}
                  </div>
                </div>
                {isEdit && (
                  <label className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform ring-4 ring-white">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div className="text-center md:text-left mb-2">
                {isEdit ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-3xl font-extrabold text-slate-900 bg-white/50 border border-blue-200 rounded-xl px-4 py-1.5 outline-none focus:ring-2 ring-blue-400 w-full max-w-xs transition-all"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                    {userData.name} <CheckCircle2 size={24} className="text-blue-500" />
                  </h1>
                )}
                <p className="text-slate-500 font-medium mt-1 text-lg">Patient • @{userData.name?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full md:w-auto justify-center md:justify-end gap-3 mb-2">
              {isEdit ? (
                <>
                  <button
                    onClick={() => { setIsEdit(false); setImage(null); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all active:scale-95"
                  >
                    <Save size={18} /> Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <Edit2 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Bottom Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar (Overview) */}
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-lg border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600"/> Overview
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={18}/></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-400">Account Type</p>
                    <p className="font-semibold text-slate-800">Personal Profile</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={18}/></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-400">Status</p>
                    <p className="font-semibold text-green-600">Verified Patient</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Contact Information */}
            <div className="bg-white/70 backdrop-blur-lg border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Mail size={20} className="text-blue-600"/> Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                  <p className="text-slate-800 font-semibold truncate">{userData.email}</p>
                </div>
                
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone Number</label>
                  {isEdit ? (
                    <input 
                      type="text" 
                      value={userData.phone || ''} 
                      onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white border border-blue-200 p-2.5 rounded-xl outline-none focus:ring-2 ring-blue-100 text-slate-800 font-semibold"
                    />
                  ) : (
                    <p className="text-slate-800 font-semibold">{userData.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white/70 backdrop-blur-lg border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600"/> Address Details
              </h3>
              
              {isEdit ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Address Line 1</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apartment, Suite, Building" 
                      value={userData.address?.line1 || ''} 
                      onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value }}))} 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 ring-blue-100 font-semibold text-slate-800 focus:border-blue-400" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Address Line 2</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Street, City, Region" 
                      value={userData.address?.line2 || ''} 
                      onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value }}))} 
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 ring-blue-100 font-semibold text-slate-800 focus:border-blue-400" 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Address Line 1</label>
                    <p className="text-slate-800 font-semibold">{userData.address?.line1 || 'No address set'}</p>
                  </div>
                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Address Line 2</label>
                    <p className="text-slate-800 font-semibold">{userData.address?.line2 || '—'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-white/70 backdrop-blur-lg border border-slate-100 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600"/> Basic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 p-4 border-b border-slate-100 sm:border-b-0 sm:border-r">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</span>
                  {isEdit ? (
                    <select value={userData.gender || ''} onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-800 focus:border-blue-400">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    <span className="text-slate-800 font-semibold text-lg">{userData.gender || '—'}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                  {isEdit ? (
                    <input type="date" value={userData.dob || ''} onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-800 focus:border-blue-400" />
                  ) : (
                    <span className="text-slate-800 font-semibold text-lg">{userData.dob || '—'}</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;