import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const called = useRef(false);

  // Variables-ka xakameeya UI-ga cusub
  const [paymentStatus, setPaymentStatus] = useState('loading'); // 'loading' ama 'success'
  const [navPath, setNavPath] = useState('');
  const [isConsultation, setIsConsultation] = useState(false);

  const verifyPayment = async () => {
    if (called.current) return;
    called.current = true;

    try {
      const success = searchParams.get("success");
      const appointmentId = searchParams.get("appointmentId");
      const type = searchParams.get("type"); 
      const session_id = searchParams.get("session_id");

      if (success === "true") {
        const { data } = await axios.post(
          `${backendUrl}/api/user/verify-stripe`,
          { success, appointmentId, type, session_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setPaymentStatus('success');
          
          // 🛑 GO'AAMINTA NAVIGATION-KA (Halkan waxaa lagu kala weecinayaa Consultations iyo Appointments)
          const isCons = type === 'consultation';
          setIsConsultation(isCons);
          
          // Wuxuu tagayaa '/my-consultations' haddii uu yahay consultation
          const path = isCons ? '/my-consultations' : '/my-appointments';
          setNavPath(path);

          // Si toos ah u wareeji 4 ilbiriqsi kadib
          setTimeout(() => {
            navigate(path);
          }, 4000);

        } else {
          toast.error(data.message);
          navigate('/');
        }
      } else {
        toast.error("Lacag bixinta waa la joojiyay.");
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Cillad ayaa dhacday');
      navigate('/');
    }
  };

  useEffect(() => {
    if (token) {
      verifyPayment();
    }
  }, [token, searchParams]);

  // ---------------- UI-GA GUUSHA (BLUE SUCCESS PAGE) ----------------
  if (paymentStatus === 'success') {
    return (
      <div className='flex items-center justify-center min-h-[70vh]'>
        <div className="bg-blue-600 text-white rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center text-center">
          
          {/* Astaanta Saxda (Checkmark Icon) */}
          <div className="bg-white rounded-full p-4 mb-6 shadow-inner">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold mb-3">Payment Successful!</h2>
          <p className="text-blue-100 mb-8 text-lg font-medium">
            Lacagtaadii si guul leh ayaa loo xaqiijiyay. {isConsultation ? 'La-talintaadii (Consultation)' : 'Ballantaadii (Appointment)'} waa la qabtay.
          </p>
          
          {/* Batoonka wareejinta (Navigation Button) */}
          <button 
            onClick={() => navigate(navPath)}
            className="w-full bg-white text-blue-600 font-bold text-lg py-3 px-4 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-md"
          >
            Eeg {isConsultation ? 'La-talintayda' : 'Ballamahayga'}
          </button>
          
          {/* Fariinta wareejinta tooska ah */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-200">Si toos ah ayaad u wareegaysaa...</p>
          </div>

        </div>
      </div>
    );
  }

  // ---------------- UI-GA SUGITAANKA (LOADING PAGE) ----------------
  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg font-medium">Fadlan sug, lacagtaada ayaa la xaqiijinayaa...</p>
      </div>
    </div>
  );
};

export default VerifyPayment;