import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { HospitalContext } from "../context/HospitalContext";
import { PharmacyContext } from "../context/PharmacyContext"; 
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Mail,
  Lock,
  HeartHandshake
} from "lucide-react";

const Login = () => {
  const [state, setState] = useState("Admin"); 
  const [isForgotMode, setIsForgotMode] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //
  const { setAToken, backendUrl, atoken } = useContext(AdminContext);
  const { setDToken, dToken } = useContext(DoctorContext);
  const { setHToken, hToken } = useContext(HospitalContext);
  const { setPToken, pToken } = useContext(PharmacyContext); 
  
  
  useEffect(() => {
    if (atoken) navigate('/admin-dashboard');
    else if (dToken) navigate('/doctor-dashboard');
    else if (hToken) navigate('/hospital-dashboard');
    else if (pToken) navigate('/pharmacy-dashboard');
  }, [atoken, dToken, hToken, pToken, navigate]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Fadlan geli email-kaaga");
    
    setLoading(true);
    try {
      const roleLower = state.toLowerCase();
      const endpoint = `/api/${roleLower}/forgot-password`;

      const { data } = await axios.post(`${backendUrl}${endpoint}`, { email });

      if (data.success) {
        toast.success(data.message || "OTP ayaa email-kaaga loo diray!");
        
        setTimeout(() => {
            navigate(`/verify-otp?email=${email}&role=${state}`);
        }, 1500);

      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cillad ayaa dhacday, hubi in server-ku shaqaynayo");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. LOGIN HANDLER ---
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!email || !password) return toast.warning("Fadlan buuxi dhamaan meelaha banaan");
    
    setLoading(true);
    try {
      let path = "";
      if (state === "Admin") path = "/api/admin/login";
      else if (state === "Doctor") path = "/api/doctor/login";
      else if (state === "Hospital") path = "/api/hospital/login";
      else if (state === "Pharmacy") path = "/api/pharmacy/login"; 
      
      const { data } = await axios.post(`${backendUrl}${path}`, { email, password });

      if (data.success) {
        // Habaynta magaca token-ka
        const tokenKey = state === "Admin" ? "aToken" : 
                         state === "Doctor" ? "dToken" : 
                         state === "Hospital" ? "hToken" : 
                         state === "Pharmacy" ? "pToken" : ""; 

        if (tokenKey) {
            localStorage.setItem(tokenKey, data.token);
        }

        
        if (state === "Admin") setAToken(data.token);
        if (state === "Doctor") setDToken(data.token);
        if (state === "Hospital") setHToken(data.token);
        if (state === "Pharmacy") setPToken(data.token); 
       
        toast.success(`Si guul leh ayaad u gashay ${state} Portal`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xogta aad gelisay waa khalad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] relative overflow-hidden font-sans text-left px-4">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-blue-50 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[460px] z-10"
      >
        {/* Logo Section */}
        <div onClick={() => navigate('/')} className='flex items-center justify-center gap-2.5 cursor-pointer mb-8 group'>
          <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <HeartHandshake size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-blue-600">
            Gargaar
          </span>
        </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10">
          
          <AnimatePresence mode="wait">
            {!isForgotMode ? (
              <motion.div 
                key="login" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gargaar Login</h2>
                  <p className="text-slate-400 text-sm mt-1">Authorized Access Only</p>
                </div>

                {/* Role Switcher - Dib ayaan ugu celiyay 4 qaybood oo Pharmacy ku jiro */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1.5 rounded-2xl mb-8">
                  {["Admin", "Doctor", "Hospital", "Pharmacy"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setState(role)}
                      className={`py-2.5 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all duration-200 ${
                        state === role ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
                      <Mail size={14} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder={`${state.toLowerCase()}@gargaar.com`} 
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Lock size={14} /> Password
                      </label>
                      {state !== 'Admin' && (
                        <button type="button" onClick={() => setIsForgotMode(true)} className="text-[11px] text-blue-600 font-bold hover:underline">
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Sign In to Dashboard</span><ChevronRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* --- RECOVERY MODE --- */
              <motion.div 
                key="forgot" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => setIsForgotMode(false)} 
                  className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
                <div className="mb-8 text-left">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{state} Recovery</h2>
                  <p className="text-slate-400 text-sm mt-1">Geli email-kaaga si aan kuugu soo dirno 6-da lambar ee xaqiijinta (OTP).</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 block">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="recovery@example.com" 
                        className="w-full pl-12 pr-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Send OTP Code</span>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secure Badge */}
          <div className="mt-10 flex items-center gap-2 justify-center py-3 border-t border-slate-50">
             <ShieldAlert size={14} className="text-green-500" />
             <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">Secure Gargaar Encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;