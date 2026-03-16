import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className='md:mx-10 px-4 sm:px-0'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* Left Section */}
        <div>
          <div onClick={() => navigate('/')} className='flex items-center gap-2 cursor-pointer mb-5'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg'>G</div>
            <span className='text-xl font-display font-bold text-primary tracking-tight'>Gargaar</span>
          </div>
          <p className='w-full md:w-2/3 text-slate-600 leading-6'>
            Gargaar is a leading healthcare platform dedicated to connecting patients with the best medical professionals. We strive to make healthcare accessible, efficient, and reliable for everyone.
          </p>
        </div>

        {/* Center Section */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-slate-600'>
            <li className='cursor-pointer hover:text-primary transition-colors'>Home</li>
            <li className='cursor-pointer hover:text-primary transition-colors'>About us</li>
            <li className='cursor-pointer hover:text-primary transition-colors'>Contact us</li>
            <li className='cursor-pointer hover:text-primary transition-colors'>Privacy policy</li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-slate-600'>
            <li>+1-212-456-7890</li>
            <li>contact@gargaar.com</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div>
        <hr className='border-slate-200' />
        <p className='py-5 text-sm text-center text-slate-500'>Copyright 2026 @ Gargaar.com - All Right Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
