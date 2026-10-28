import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { ChevronDown, Menu, X, LogOut, User, Calendar, HeartHandshake } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const navigate = useNavigate()
  const { token, setToken, userData } = useContext(AppContext)

  const [showMenu, setShowMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const logout = () => {
    setToken(false)
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-slate-200 sticky top-0 bg-white z-50 px-4 sm:px-[10%]'>

      {/* --- LOGO SECTION --- */}
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <HeartHandshake size={24} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-blue-600">
          Gargaar
        </span>
      </div>

      {/* --- DESKTOP MENU --- */}
      <ul className='hidden md:flex items-start gap-6 font-medium'>
        <NavLink
          to='/'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${isActive ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`
          }
        >
          HOME
        </NavLink>

        <NavLink
          to='/doctors'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${isActive ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`
          }
        >
          ALL DOCTORS
        </NavLink>
        

        <NavLink
          to='/posts'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${isActive ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`
          }
        >

          POSTS
        </NavLink>

        <NavLink
          to='/pharmacy'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${isActive ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`
          }
        >

          PHARMACY
        </NavLink>

        <NavLink
          to='/about'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${isActive ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`
          }
        >
          ABOUT
        </NavLink>

        <NavLink
          to='/contact'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${isActive ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-indigo-600'}`
          }
        >
          CONTACT
        </NavLink>
      </ul>

      {/* --- RIGHT SIDE (Profile / Login) --- */}
      <div className='flex items-center gap-4'>
        {token && userData ? (
          <div
            className='flex items-center gap-2 cursor-pointer relative'
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <img
              className='w-8 h-8 rounded-full object-cover'
              src={userData.image || `https://ui-avatars.com/api/?name=${userData.name}&background=4f46e5&color=fff`}
              alt='Profile'
            />
            <ChevronDown size={16} className='text-slate-500' />

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className='absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden'
                >
                  <p onClick={() => navigate('/my-profile')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <User size={18} /> My Profile
                  </p>
                  <p onClick={() => navigate('/my-appointments')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <Calendar size={18} /> My Appointments
                  </p>
                  
                   <p onClick={() => navigate('/my-Consultations')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <Calendar size={18} /> My Consultations
                  </p>
                   <p onClick={() => navigate('/my-orders')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <Calendar size={18} /> My Orders
                  </p>
                  <p onClick={() => navigate('/messages')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <Calendar size={18} /> Messages
                  </p>
                   <p onClick={() => navigate('/my-Consultations')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <Calendar size={18} /> My Consultations
                  </p>
                  <p onClick={() => navigate('/cart')} className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-zinc-700'>
                    <Calendar size={18} /> Cart
                  </p>
                  <p onClick={logout} className='px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 cursor-pointer border-t'>
                    <LogOut size={18} /> Logout
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hidden md:block hover:bg-indigo-700 transition shadow-md shadow-indigo-100'
          >
            Create account
          </button>
        )}

        {/* Mobile Menu Toggle Button */}
        <button onClick={() => setShowMenu(true)} className='md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition'>
          <Menu size={24} />
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed inset-0 bg-white z-[60] md:hidden flex flex-col p-6'
          >
            {/* Mobile Header with Logo */}
            <div className='flex items-center justify-between mb-10'>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <HeartHandshake size={24} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-zinc-900">
                  Gargaar
                </span>
              </div>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Navigation Links */}
            <ul className='flex flex-col gap-5 text-xl font-semibold text-zinc-800'>
              <NavLink onClick={() => setShowMenu(false)} to='/'>HOME</NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctors'>ALL DOCTORS</NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/posts'>POSTS</NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/about'>ABOUT</NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/contact'>CONTACT</NavLink>
              
              {!token && (
                <button
                  onClick={() => {
                    navigate('/login');
                    setShowMenu(false);
                  }}
                  className='bg-indigo-600 text-white px-10 py-4 rounded-2xl mt-4 w-full shadow-lg shadow-indigo-100'
                >
                  Create account
                </button>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Navbar