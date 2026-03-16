import React from 'react';

const Contact = () => {
  return (
    <div className='px-4 sm:px-[10%] py-10'>
      <div className='text-center text-2xl pt-10 text-slate-500'>
        <p>CONTACT <span className='text-slate-700 font-bold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px] rounded-2xl shadow-lg' src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop" alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-display font-bold text-lg text-slate-700 uppercase tracking-wider'>Our OFFICE</p>
          <p className='text-slate-500 leading-relaxed'>123 Medical Plaza <br /> Suite 450, New York, USA</p>
          <p className='text-slate-500'>Tel: (415) 555-0132 <br /> Email: contact@gargaar.com</p>
          <p className='font-display font-bold text-lg text-slate-700 uppercase tracking-wider'>CAREERS AT GARGAAR</p>
          <p className='text-slate-500'>Learn more about our teams and job openings.</p>
          <button className='border border-slate-900 px-8 py-4 text-sm hover:bg-slate-900 hover:text-white transition-all duration-500 rounded-lg font-medium'>Explore Jobs</button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
