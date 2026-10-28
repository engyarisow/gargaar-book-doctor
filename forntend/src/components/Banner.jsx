import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate = useNavigate()

  return (
    <div className='relative overflow-hidden flex bg-white rounded-[2rem] px-8 sm:px-12 md:px-16 lg:px-20 my-20 md:mx-10 border border-blue-50 shadow-[0_20px_50px_rgba(0,118,255,0.08)]'> 
        
        {/* --- Modern Blue Accents (Soft Mesh) --- */}
        <div className='absolute -top-10 -right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'></div>
        
        {/* ------- Left Side ------- */}
        <div className='flex-1 py-12 sm:py-20 lg:py-28 z-10'>
           <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6'>
              <span className='w-2 h-2 rounded-full bg-blue-500 animate-pulse'></span>
              Now Accepting New Patients
           </div>

           <div className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]'>
            <p>Book Appointment</p>
            <p className='text-blue-600'>With 100+ Trusted Doctors</p>
           </div>
           
           <p className='mt-6 text-slate-500 text-base sm:text-lg max-w-md leading-relaxed font-medium'>
             Experience seamless healthcare. Connect with verified specialists and manage your health in one place.
           </p>

            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-10'>
                <button 
                  onClick={() => { navigate('/login'); window.scrollTo(0,0) }} 
                  className='bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-95'
                >
                  Create account
                </button>
                <button className='text-slate-600 font-semibold px-6 py-4 hover:text-blue-600 transition-colors'>
                  Learn how it works
                </button>
            </div>
        </div>

        {/* ------- Right Side ------- */}
        <div className='hidden md:block md:w-1/2 lg:w-[450px] relative self-end'>
            {/* Soft glow behind the doctor */}
            <div className='absolute bottom-0 right-0 w-full h-4/5 bg-gradient-to-t from-blue-50 to-transparent rounded-t-full -z-10'></div>
            
            <img 
              className='w-full max-w-md drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]' 
              src={assets.appointment_img} 
              alt="Medical Care" 
            />
        </div>
    </div>
  )
}

export default Banner