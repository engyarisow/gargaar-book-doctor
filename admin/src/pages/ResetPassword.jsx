import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    // Token-ka halkan waa OTP-gii laga soo baasay URL-ka
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Ka soo saar role-ka URL-ka (Tusaale: ?role=Doctor)
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get("role") || "Doctor";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        // Hubinta Password-ka
        if (newPassword.length < 8) return toast.error("Password-ku waa inuu 8 xaraf ka badnaadaa");
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match!");

        setLoading(true);
        try {
            // Ka dhig role-ka xarfo yaryar si URL-ku u noqdo mid sax ah (doctor, clinic, hospital)
            const roleLower = role.toLowerCase();
            let path = `/api/${roleLower}/reset-password/${token}`;

            const { data } = await axios.post(`${backendUrl}${path}`, { password: newPassword });

            if (data.success) {
                toast.success(`${role} password updated successfully!`);
                // Marka uu guuleysto, ku celi bogga Login-ka
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Reset Error:", error);
            toast.error("Cillad ayaa dhacday, hubi server-ka!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{role} Password Reset</h2>
                    <p className="text-slate-400 text-sm mt-1">Geli password cusub oo ammaan ah</p>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm Password</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : `Update Password`}
                    </button>
                </form>

                <div className="mt-8 flex items-center gap-2 justify-center text-slate-300">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gargaar Secure Portal</span>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;