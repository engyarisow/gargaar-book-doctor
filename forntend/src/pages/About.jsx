import React from 'react';

const About = () => {
  return (
    <div className='px-4 sm:px-[10%] py-10'>
      <div className='text-center text-2xl pt-10 text-slate-500'>
        <p>ABOUT <span className='text-slate-700 font-bold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px] rounded-2xl shadow-lg' src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop" alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-slate-600 leading-relaxed'>
          <p>Welcome to Gargaar, your trusted partner in managing your healthcare needs conveniently and efficiently. At Gargaar, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.</p>
          <p>Gargaar is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Gargaar is here to support you every step of the way.</p>
          <b className='text-slate-800 text-lg font-display'>Our Vision</b>
          <p>Our vision at Gargaar is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.</p>
        </div>
      </div>

      <div className='text-xl my-4 font-display font-bold'>
        <p>WHY <span className='text-primary'>CHOOSE US</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20 gap-4'>
        <div className='border border-slate-200 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer rounded-2xl group'>
          <b className='group-hover:text-white transition-colors'>EXCELLENCE:</b>
          <p className='text-slate-600 group-hover:text-white/90 transition-colors'>Our network consists of top-rated medical professionals dedicated to providing the highest quality care.</p>
        </div>
        <div className='border border-slate-200 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer rounded-2xl group'>
          <b className='group-hover:text-white transition-colors'>CONVENIENCE:</b>
          <p className='text-slate-600 group-hover:text-white/90 transition-colors'>Access to a network of trusted healthcare professionals in your area, available at your fingertips.</p>
        </div>
        <div className='border border-slate-200 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer rounded-2xl group'>
          <b className='group-hover:text-white transition-colors'>PERSONALIZATION:</b>
          <p className='text-slate-600 group-hover:text-white/90 transition-colors'>Tailored recommendations and reminders to help you stay on top of your health.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
