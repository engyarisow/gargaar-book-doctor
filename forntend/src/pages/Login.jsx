import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { HeartHandshake, Loader2, ArrowLeft } from 'lucide-react'

const Login = () => {
  const { backendUrl, token, setToken, loadUserProfileData } = useContext(AppContext)
  const navigate = useNavigate()

  const [state, setState] = useState('Sign Up')
  const [isForgotMode, setIsForgotMode] = useState(false) // Xaaladda Forgot Password
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // --- 1. LOGIN & SIGNUP HANDLER ---
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      let response;
      if (state === 'Sign Up') {
        response = await axios.post(`${backendUrl}/api/user/register`, { name, email, password })
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, { email, password })
      }

      const { data } = response

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success(state === 'Sign Up' ? 'Account created successfully' : 'Login successful')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  // --- 2. FORGOT PASSWORD HANDLER (CUSUB) ---
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) return toast.warning("Fadlan geli iimaylkaaga xogta ku jira")

    setLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, { email })
      
      if (data.success) {
        toast.success(data.message || "OTP Code ayaa laguu soo diray!")
        // Toos ugu dhoofi bogga verify-otp adigoo u baasaya role=User
        setTimeout(() => {
          navigate(`/verify-otp?email=${email}&role=User`)
        }, 1500)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cillad ayaa dhacday")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadUserProfileData()
      navigate('/')
    }
  }, [token, loadUserProfileData, navigate])

  return (
    <div className='min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] py-12'>
      <div className='w-full max-w-md bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300'>
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <HeartHandshake size={28} />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
            Gargaar
          </span>
        </div>

        {!isForgotMode ? (
          /* --- LOGIN / SIGN UP MODE --- */
          <form onSubmit={onSubmitHandler} className='flex flex-col gap-5'>
            <div className='w-full text-center sm:text-left mb-2'>
              <h2 className='text-3xl font-bold text-slate-800'>
                {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className='text-slate-500 mt-2 text-sm'>
                Please {state === 'Sign Up' ? 'fill in the details to sign up' : 'enter your credentials to log in'} to access Gargaar.
              </p>
            </div>

            {state === 'Sign Up' && (
              <div className='w-full'>
                <label className='text-slate-700 text-sm font-semibold mb-1.5 block'>Full Name</label>
                <input
                  className='w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400'
                  type='text'
                  placeholder='Engyarisow'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className='w-full'>
              <label className='text-slate-700 text-sm font-semibold mb-1.5 block'>Email Address</label>
              <input
                className='w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400'
                type='email'
                placeholder='example@gmail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='w-full'>
              <div className="flex justify-between items-center mb-1.5">
                <label className='text-slate-700 text-sm font-semibold block'>Password</label>
                {state === 'Login' && (
                  <span 
                    onClick={() => setIsForgotMode(true)} // Toggles to forgot mode
                    className="text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <input
                className='w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl text-lg font-semibold shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2'
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (state === 'Sign Up' ? 'Get Started' : 'Sign In')}
            </button>

            <div className='w-full text-center mt-2'>
              <p className='text-slate-600 text-sm'>
                {state === 'Sign Up' ? 'Already have an account? ' : 'New to Gargaar? '}
                <span
                  onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
                  className='text-indigo-600 font-bold hover:underline cursor-pointer transition-colors'
                >
                  {state === 'Sign Up' ? 'Login here' : 'Create an account'}
                </span>
              </p>
            </div>
          </form>
        ) : (
          /* --- RECOVERY MODE (FORGOT PASSWORD) --- */
          <form onSubmit={handleForgotPassword} className='flex flex-col gap-5 text-left'>
            <button 
              type="button"
              onClick={() => setIsForgotMode(false)} 
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold mb-2"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
            
            <div>
              <h2 className='text-2xl font-bold text-slate-800'>Account Recovery</h2>
              <p className='text-slate-500 mt-1 text-sm'>
                Geli iimaylkaaga diiwaangashan si aan kuugu soo dirno 6-da lambar ee xaqiijinta (OTP).
              </p>
            </div>

            <div className='w-full'>
              <label className='text-slate-700 text-sm font-semibold mb-1.5 block'>Your Email Address</label>
              <input
                className='w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all'
                type='email'
                placeholder='example@gmail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-slate-900 text-white py-3.5 rounded-xl text-lg font-semibold hover:bg-black transition-all flex items-center justify-center gap-2'
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login