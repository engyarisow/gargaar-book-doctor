import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Zap, Heart, ArrowRight } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className='bg-white selection:bg-blue-100'>
      {/* Hero Header */}
      <div className='relative overflow-hidden pt-20 pb-10 px-4 sm:px-[10%]'>
        {/* Soft Background Glows */}
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -z-10' />
        
        <motion.div 
          {...fadeIn}
          className='text-center space-y-4'
        >
          <h2 className='text-sm font-bold tracking-[0.2em] text-blue-600 uppercase'>Our Story</h2>
          <h1 className='text-4xl md:text-6xl font-black text-slate-900 tracking-tight'>
            Redefining the <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500'>Healthcare</span> Experience.
          </h1>
        </motion.div>
      </div>

      {/* Mission Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-[10%] py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className='relative'
          >
            <div className='absolute -top-4 -left-4 w-24 h-24 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob' />
            <div className='absolute -bottom-8 right-10 w-32 h-32 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000' />
            
            <img 
              className='relative w-full rounded-[2.5rem] shadow-2xl z-10 hover:scale-[1.02] transition-all duration-700 object-cover aspect-[4/3]' 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop" 
              alt="Medical Team" 
            />
            
            <div className='absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl z-20 border border-blue-50 hidden md:block'>
              <p className='text-4xl font-black text-blue-600'>10k+</p>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Happy Patients</p>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className='space-y-8'
          >
            <div className='space-y-6 text-lg text-slate-500 leading-relaxed'>
              <p>
                Welcome to <span className='font-bold text-slate-900'>Gargaar</span>, your trusted partner in managing healthcare with digital precision. We understand that navigating medical schedules shouldn't be a secondary headache.
              </p>
              <p>
                We continuously strive to enhance our platform, integrating expert-driven scheduling and secure record management to deliver a superior user experience.
              </p>
            </div>

            <div className='p-8 bg-blue-50/50 rounded-[2rem] border-l-4 border-blue-600 shadow-sm'>
              <h3 className='text-xl font-bold text-slate-900 mb-3 italic'>Our Vision</h3>
              <p className='text-slate-600 font-medium'>
                To bridge the gap between patients and providers through a seamless, borderless digital ecosystem where care is always one click away.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className='px-4 sm:px-[10%] py-24 bg-slate-50/50'>
        <motion.div {...fadeIn} className='mb-16'>
          <h2 className='text-3xl md:text-4xl font-black text-slate-900 mb-2'>
            Why <span className='text-blue-600'>Choose Us</span>
          </h2>
          <div className='h-1.5 w-20 bg-blue-600 rounded-full' />
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {[
            {
              title: "Excellence",
              desc: "Our network consists of top-rated medical professionals dedicated to providing high-quality care.",
              icon: <Award size={32} />,
              colorClass: "text-blue-600",
              hoverBg: "hover:bg-blue-600"
            },
            {
              title: "Convenience",
              desc: "Access to a network of trusted healthcare professionals in your area, available 24/7.",
              icon: <Zap size={32} />,
              colorClass: "text-indigo-600",
              hoverBg: "hover:bg-indigo-600"
            },
            {
              title: "Personalization",
              desc: "Tailored health recommendations and automated reminders to keep you on track.",
              icon: <Heart size={32} />,
              colorClass: "text-rose-600",
              hoverBg: "hover:bg-rose-600"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -12 }}
              className={`group p-10 bg-white rounded-[2.5rem] border border-blue-50 shadow-sm transition-all duration-500 cursor-pointer ${item.hoverBg}`}
            >
              <div className='mb-6 p-4 bg-slate-50 rounded-2xl inline-block group-hover:bg-white/20 transition-colors'>
                {React.cloneElement(item.icon, { 
                  className: `${item.colorClass} group-hover:text-white transition-colors` 
                })}
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-4 group-hover:text-white transition-colors uppercase tracking-tight'>
                {item.title}
              </h3>
              <p className='text-slate-500 leading-relaxed group-hover:text-white/80 transition-colors'>
                {item.desc}
              </p>
              <div className='mt-8 flex items-center gap-2 text-blue-600 font-bold group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all'>
                Learn More <ArrowRight size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section (Updated to Blue & White Theme) */}
      <motion.div 
        {...fadeIn}
        className='px-4 sm:px-[10%] py-24 text-center'
      >
        <div className='relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-[3.5rem] p-12 md:p-24 shadow-2xl shadow-blue-200/50'>
           {/* Decorative Elements */}
           <div className='absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full filter blur-3xl' />
           <div className='absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-400/20 rounded-full filter blur-2xl' />
           
           <h2 className='text-4xl md:text-6xl font-black text-white mb-10 relative z-10 tracking-tight leading-tight max-w-3xl mx-auto'>
             Ready to prioritize <br /> <span className='text-blue-100 italic font-medium'>your health?</span>
           </h2>
           
           <button 
             onClick={() => { navigate('/'); window.scrollTo(0,0) }} 
             className='bg-white text-blue-600 px-12 py-5 rounded-full font-black text-lg
                        hover:bg-blue-50 hover:scale-105 transition-all duration-300 
                        active:scale-95 relative z-10 shadow-2xl shadow-black/10'
           >
             Book Your Appointment Now
           </button>

           {/* Medical Symbol Background Detail */}
           <div className='absolute bottom-5 right-10 text-white/5 font-black text-[12rem] select-none leading-none'>
             +
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;