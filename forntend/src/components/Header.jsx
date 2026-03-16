import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion'; // use framer-motion for animations

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[600px] flex flex-col md:flex-row items-center bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/50 mb-12">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4 z-0 hidden md:block" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl z-0" />

      {/* Left Side: Content */}
      <div className="relative z-10 md:w-3/5 flex flex-col items-start justify-center gap-8 p-8 md:p-16 lg:p-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-wider uppercase"
        >
          <Sparkles size={14} />
          Modern Healthcare Solutions
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.1] tracking-tight"
        >
          Healthcare <br />
          <span className="text-primary">Redefined.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-lg leading-relaxed"
        >
          Connect with world-class specialists in minutes. Gargaar brings premium medical expertise directly to your fingertips with a seamless booking experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-6"
        >
          <button
            onClick={() => navigate('/doctors')}
            className="btn-primary flex items-center gap-3 group"
          >
            Find a Specialist
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  src={`https://i.pravatar.cc/100?img=${i + 20}`}
                  alt=""
                />
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold text-slate-900">2.5k+ Patients</p>
              <p className="text-slate-500">Trust our platform</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-4"
        >
          {[
            { icon: CheckCircle, text: 'Verified Doctors' },
            { icon: Calendar, text: 'Instant Booking' },
            { icon: Users, text: 'Expert Care' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-500 text-sm">
              <item.icon size={16} className="text-accent" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Side: Image/Visual */}
      <div className="relative z-10 md:w-2/5 h-[400px] md:h-full w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative h-full w-full flex items-center justify-center p-8"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-75" />

          <img
            className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
            src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1000&auto=format&fit=crop"
            alt="Doctor"
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop
              e.target.src =
                'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=1000&auto=format&fit=crop';
            }}
          />

          {/* Floating Stats Cards */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-4 glass-card p-4 rounded-2xl flex items-center gap-3 z-20"
          >
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Success Rate</p>
              <p className="text-lg font-bold text-slate-900">99.2%</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/4 left-4 glass-card p-4 rounded-2xl flex items-center gap-3 z-20"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Doctors</p>
              <p className="text-lg font-bold text-slate-900">150+</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Header;