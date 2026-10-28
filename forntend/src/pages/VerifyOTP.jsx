import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

const VerifyOTP = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email');
  const role = searchParams.get('role') || 'User'; 

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Hubinta inuu email-ku jiro
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.warning('Fadlan geli 6-da lambar ee saxda ah');
      return;
    }

    setLoading(true);
    try {
      const roleLower = role.toLowerCase();
      const endpoint = `/api/${roleLower}/verify-otp`;

      const { data } = await axios.post(`${backendUrl}${endpoint}`, { email, otp });

      if (data.success) {
        toast.success(data.message || 'OTP waa la xaqiijiyay!');
        
        // Halkan ayaad ku navigate-gareynaysaa ResetPassword
        setTimeout(() => {
          navigate(`/reset-password/${otp}?role=${role}`);
        }, 1000);
      } else {
        toast.error(data.message || "OTP-gu waa khaldan yahay!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cillad ayaa dhacday, isku day mar kale!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-slate-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-100'>
        <button 
          onClick={() => navigate('/login')} 
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 font-semibold"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className='text-3xl font-bold text-slate-800'>Verify OTP</h2>
          <p className='text-slate-500 mt-2 text-sm'>
            Fadlan geli 6-da lambar ee loo diray:<br/>
            <span className="font-semibold text-indigo-600">{email}</span>
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-6'>
          <input
            type='text'
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder='000000'
            className='w-full text-center text-4xl tracking-[0.5em] font-bold border rounded-2xl p-4 bg-slate-50 focus:border-indigo-500 outline-none transition-all'
            required
          />
          <button
            type='submit'
            disabled={loading || otp.length !== 6}
            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all'
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;