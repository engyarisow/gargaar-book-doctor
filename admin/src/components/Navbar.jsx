import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { atoken, setAToken, dToken, setDToken } = useContext(AdminContext);

  const logout = () => {
    navigate('/');
    localStorage.removeItem('aToken');
    localStorage.removeItem('dToken'); // if you store doctor's token too
    setAToken('');
    setDToken('');
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      
      {/* Text Logo */}
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
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 text-xs'>
          {atoken ? 'Admin' : 'Doctor'}
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>

    </div>
  );
};

export default Navbar;