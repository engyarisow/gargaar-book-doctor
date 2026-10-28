// Frontend: VerifyOTP.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Soo qabo Email-ka iyo Role-ka laga soo diray page-kii hore (Forgot Password)
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");
    const role = queryParams.get("role") || "Doctor";

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error("OTP waa inuu yahay 6 lambar");

        setLoading(true);
        try {
            // Hubi in path-ka uu ku xiran yahay role-ka
            let path = "";
            if (role === "Doctor") path = `/api/doctor/verify-otp`;
            else if (role === "Hospital") path = `/api/hospital/verify-otp`;
            else if (role === "Clinic") path = `/api/clinic/verify-otp`;

            const { data } = await axios.post(`${backendUrl}${path}`, { email, otp });

            if (data.success) {
                toast.success("OTP si guul leh ayaa loo xaqiijiyay!");
                // Hadda u gudbi page-ka Reset Password adigoo wata OTP-ga
                setTimeout(() => navigate(`/reset-password/${otp}?role=${role}`), 1000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Cillad ayaa dhacday, isku day mar kale!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Xaqiiji OTP</h2>
                    <p className="text-slate-400 text-sm mt-1">Geli 6-da lambar ee loogu soo diray email-kaaga: <b>{email}</b></p>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    <div className="space-y-1.5">
                        <input type="text" required value={otp} maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Kaliya lambar ogolow
                            placeholder="123456"
                            className="w-full px-5 py-4 text-center text-2xl tracking-[0.5em] font-bold bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Xaqiiji OTP"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;