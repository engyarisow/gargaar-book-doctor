import React, { useContext, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { ChevronDown, Menu, X, LogOut, User, Calendar } from 'lucide-react'
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

      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        className='flex items-center gap-2 cursor-pointer'
      >
        <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl'>
          G
        </div>

        <span className='text-xl font-bold text-primary tracking-tight'>
          Gargaar
        </span>
      </div>


      {/* Desktop Menu */}
      <ul className='hidden md:flex items-start gap-6 font-medium'>

        <NavLink
          to='/'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${
              isActive
                ? 'text-primary border-primary'
                : 'border-transparent hover:text-primary'
            }`
          }
        >
          HOME
        </NavLink>

        <NavLink
          to='/doctors'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${
              isActive
                ? 'text-primary border-primary'
                : 'border-transparent hover:text-primary'
            }`
          }
        >
          ALL DOCTORS
        </NavLink>

        <NavLink
          to='/about'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${
              isActive
                ? 'text-primary border-primary'
                : 'border-transparent hover:text-primary'
            }`
          }
        >
          ABOUT
        </NavLink>

        <NavLink
          to='/contact'
          className={({ isActive }) =>
            `pb-1 border-b-2 transition ${
              isActive
                ? 'text-primary border-primary'
                : 'border-transparent hover:text-primary'
            }`
          }
        >
          CONTACT
        </NavLink>

      </ul>


      {/* Right Side */}
      <div className='flex items-center gap-4'>

        {token && userData ? (

          <div
            className='flex items-center gap-2 cursor-pointer relative'
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >

            <img
              className='w-8 h-8 rounded-full object-cover'
              src={
                userData.image ||
                `https://ui-avatars.com/api/?name=${userData.name}&background=5f6FFF&color=fff`
              }
              alt=''
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

                  <p
                    onClick={() => navigate('/my-profile')}
                    className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer'
                  >
                    <User size={18} /> My Profile
                  </p>

                  <p
                    onClick={() => navigate('/my-appointments')}
                    className='px-4 py-3 hover:bg-slate-50 flex items-center gap-2 cursor-pointer'
                  >
                    <Calendar size={18} /> My Appointments
                  </p>

                  <p
                    onClick={logout}
                    className='px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 cursor-pointer border-t'
                  >
                    <LogOut size={18} /> Logout
                  </p>

                </motion.div>

              )}
            </AnimatePresence>

          </div>

        ) : (

          <button
            onClick={() => navigate('/login')}
            className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block hover:opacity-90 transition'
          >
            Create account
          </button>

        )}


        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMenu(true)}
          className='md:hidden p-2 text-slate-600'
        >
          <Menu size={24} />
        </button>

      </div>



      {/* Mobile Menu */}
      <AnimatePresence>

        {showMenu && (

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed inset-0 bg-white z-50 md:hidden flex flex-col'
          >

            <div className='flex items-center justify-between px-5 py-6 border-b'>

              <div className='flex items-center gap-2'>

                <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg'>
                  G
                </div>

                <span className='text-lg font-bold text-primary'>
                  Gargaar
                </span>

              </div>

              <button onClick={() => setShowMenu(false)}>
                <X size={24} />
              </button>

            </div>


            <ul className='flex flex-col items-center gap-6 mt-10 text-lg font-medium'>

              <NavLink onClick={() => setShowMenu(false)} to='/'>
                HOME
              </NavLink>

              <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
                ALL DOCTORS
              </NavLink>

              <NavLink onClick={() => setShowMenu(false)} to='/about'>
                ABOUT
              </NavLink>

              <NavLink onClick={() => setShowMenu(false)} to='/contact'>
                CONTACT
              </NavLink>

              {!token && (

                <button
                  onClick={() => {
                    navigate('/login')
                    setShowMenu(false)
                  }}
                  className='bg-primary text-white px-10 py-3 rounded-full mt-4'
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