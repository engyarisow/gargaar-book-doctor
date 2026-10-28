import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react'; // Added import for the icon

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className='md:mx-10 px-4 sm:px-0'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        
        {/* Left Section */}
        <div>
          {/* Logo Section - Matches Navbar */}
          <div 
            onClick={() => navigate('/')} 
            className='flex items-center gap-3 cursor-pointer mb-5'
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <HeartHandshake size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-indigo-600">
              Gargaar
            </span>
          </div>

          <p className='w-full md:w-2/3 text-slate-600 leading-6'>
            Gargaar is a leading healthcare platform dedicated to connecting patients with the best medical professionals. We strive to make healthcare accessible, efficient, and reliable for everyone.
          </p>
        </div>

        {/* Center Section */}
        <div>
          <p className='text-xl font-medium mb-5 text-zinc-800'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-slate-600'>
            <li onClick={() => navigate('/')} className='cursor-pointer hover:text-indigo-600 transition-colors'>Home</li>
            <li onClick={() => navigate('/about')} className='cursor-pointer hover:text-indigo-600 transition-colors'>About us</li>
            <li onClick={() => navigate('/contact')} className='cursor-pointer hover:text-indigo-600 transition-colors'>Contact us</li>
            <li className='cursor-pointer hover:text-indigo-600 transition-colors'>Privacy policy</li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <p className='text-xl font-medium mb-5 text-zinc-800'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-slate-600'>
            <li className='hover:text-indigo-600 transition-colors'>0637360206</li>
            <li className='hover:text-indigo-600 transition-colors'>contact@gargaar.com</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div>
        <hr className='border-slate-200' />
        <p className='py-5 text-sm text-center text-slate-500'>
          Copyright 2026 @ Gargaar.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;