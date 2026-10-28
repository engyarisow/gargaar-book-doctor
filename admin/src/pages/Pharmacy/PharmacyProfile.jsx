import React, { useContext } from 'react';
import { Store, Mail, Phone, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { PharmacyContext } from '../../context/PharmacyContext'; // Hubi path-ka saxda ah

const PharmacyProfile = () => {
    // Ka soo dhex saar xogta Context-ka kor ku xusan
    const { profileData, loading, error } = useContext(PharmacyContext);

    if (loading) {
        return (
            <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto flex justify-center items-center h-64">
                <p className="text-slate-500 font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    // Haddii uusan jirin Token ama qofku login samayn
    if (!profileData) {
        return (
            <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto flex justify-center items-center h-64">
                <p className="text-slate-500 font-medium">Fadlan login samee si aad xogta u aragto.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Pharmacy Profile</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your pharmacy details and payout settings.</p>
                </div>
                <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
                    Edit Profile
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Profile Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                
                <div className="px-8 pb-8 relative">
                    {/* Profile Image Avatar */}
                    <div className="w-24 h-24 bg-white p-1.5 rounded-2xl shadow-lg absolute -top-12 border border-slate-100">
                        <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {profileData.image ? (
                                <img src={profileData.image} alt={profileData.name} className="w-full h-full object-cover" />
                            ) : (
                                <Store className="text-slate-400" size={40} />
                            )}
                        </div>
                    </div>

                    <div className="pt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Basic Information</h3>
                            
                            <div className="flex gap-4 items-start">
                                <Store className="text-blue-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Pharmacy Name</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{profileData.name}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <Mail className="text-blue-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Email Address</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{profileData.email}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <Phone className="text-blue-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Contact Number</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{profileData.contactNumber}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <MapPin className="text-blue-500 mt-1" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Location</p>
                                    <p className="text-slate-800 font-medium mt-0.5">{profileData.locationText}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Account & Payout</h3>
                            
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4 items-start">
                                <ShieldCheck className={profileData.status === 'Active' ? "text-emerald-500 mt-1" : "text-amber-500 mt-1"} size={24} />
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Account Status</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {profileData.status === 'Active' 
                                            ? 'Verified & Active on Gargaar Platform.' 
                                            : `Account status is ${profileData.status}.`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-500">Payout Method</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100">
                                        {profileData.payoutMethod}
                                    </span>
                                    <p className="text-slate-700 font-medium">{profileData.payoutAccountNumber}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">About Pharmacy</p>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {profileData.about}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PharmacyProfile;