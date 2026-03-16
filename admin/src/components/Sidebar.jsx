import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  const { atoken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  // Reusable NavLink styling function
  const navLinkStyle = ({ isActive }) =>
    `flex items-center gap-3 py-3.5 px-4 md:px-9 md:min-w-64 cursor-pointer transition-all ${
      isActive
        ? 'bg-[#F2F3FF] border-r-4 border-primary text-primary'
        : 'hover:bg-gray-50 text-gray-600'
    }`

  return (
    <div className='min-h-[calc(100vh-72px)] bg-white border-r shadow-sm'>
      {atoken && (
        <ul className="pt-5 flex flex-col gap-1">
          <NavLink to="/admin-dashboard" className={navLinkStyle}>
            <img className="w-5" src={assets.home_icon} alt="Home" />
            <p className='hidden md:block font-medium'>Dashboard</p>
          </NavLink>
          <NavLink to="/All-appointments" className={navLinkStyle}>
            <img className="w-5" src={assets.appointment_icon} alt="Appointments" />
            <p className='hidden md:block font-medium'>Appointments</p>
          </NavLink>
          <NavLink to="/add-doctor" className={navLinkStyle}>
            <img className="w-5" src={assets.add_icon} alt="Add Doctor" />
            <p className='hidden md:block font-medium'>Add Doctor</p>
          </NavLink>
          <NavLink to="/doctor-list" className={navLinkStyle}>
            <img className="w-5" src={assets.people_icon} alt="Doctor List" />
            <p className='hidden md:block font-medium'>Doctor List</p>
          </NavLink>
        </ul>
      )}

      {dToken && (
        <ul className="pt-5 flex flex-col gap-1">
          <NavLink to="/doctor-dashboard" className={navLinkStyle}>
            <img className="w-5" src={assets.home_icon} alt="Home" />
            <p className='hidden md:block font-medium'>Dashboard</p>
          </NavLink>
          <NavLink to="/doctor-appointments" className={navLinkStyle}>
            <img className="w-5" src={assets.appointment_icon} alt="Appointments" />
            <p className='hidden md:block font-medium'>Appointments</p>
          </NavLink>
          <NavLink to="/doctor-profile" className={navLinkStyle}>
            <img className="w-5" src={assets.people_icon} alt="Profile" />
            <p className='hidden md:block font-medium'>Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  )
}

export default Sidebar