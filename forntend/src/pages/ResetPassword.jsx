import React, { useState, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { LockKeyhole, Loader2, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const { token } = useParams(); // Kani waa OTP-gii aan URL-ka soo raacinnay
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'User';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Password-ku isma laha!");
    }

    setLoading(true);
    try {
      const roleLower = role.toLowerCase();
      // API-ga waxaan u diraynaa token-ka (OTP-ga) URL-ka
      const { data } = await axios.post(`${backendUrl}/api/${roleLower}/reset-password/${token}`, { 
        password 
      });

      if (data.success) {
        toast.success("Password-ka si guul leh ayaa loo bedelay!");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cillad ayaa dhacday");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-slate-50 py-12'>
      <div className='w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-lg'>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <LockKeyhole size={32} />
          </div>
          <h2 className='text-2xl font-bold text-slate-800'>Set New Password</h2>
          <p className='text-slate-500 mt-2 text-sm'>Fadlan geli password cusub oo ammaan ah.</p>
        </div>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
          <input
            type='password'
            placeholder='New Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full border p-3.5 rounded-xl outline-none focus:border-blue-500'
            required
          />
          <input
            type='password'
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='w-full border p-3.5 rounded-xl outline-none focus:border-blue-500'
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700'
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;