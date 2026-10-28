import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowRight, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const [formState, setFormState] = useState("idle");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFormState("success");
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch (err) {
      setFormState("idle");
    }
  };

  // Animation Variants
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200/60 py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`, size: '40px 40px', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full"
          >
            Contact Us
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6"
          >
            Let’s start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">conversation.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you're looking for urgent care or a career change, our team is ready to help you navigate your journey.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Info Cards */}
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-8"
          >
            {/* Visual Hero Card */}
            <motion.div variants={itemVars} className="group relative overflow-hidden rounded-3xl shadow-2xl shadow-blue-200/50">
              <img
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop"
                alt="Modern Office"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Headquarters</p>
                  <h3 className="text-xl font-bold">HARGAISA</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30">
                  <Globe className="text-white" size={24} />
                </div>
              </div>
            </motion.div>

            {/* Quick Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <MapPin />, title: "Visit Us", content: "HARGAISA", color: "text-blue-600" },
                { icon: <Phone />, title: "Call Us", content: "252 063b7360206", color: "text-indigo-600" },
                { icon: <Mail />, title: "Email Us", content: "@gargaar.com", color: "text-sky-600" },
                { icon: <Clock />, title: "Hours", content: "Mon-Fri: 8am-8pm", color: "text-slate-600" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVars}
                  whileHover={{ y: -5 }}
                  className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`${item.color} mb-4`}>{React.cloneElement(item.icon, { size: 24 })}</div>
                  <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center py-20"
                  >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 text-green-500 rounded-full mb-8">
                      <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Awesome!</h2>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your message has been received. We usually respond within 2 hours.</p>
                    <button
                      onClick={() => setFormState("idle")}
                      className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg"
                    >
                      Go Back
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          placeholder="Cali"
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          placeholder="cumar"
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Cali@example.com"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 appearance-none"
                      >
                        <option value="">Dooro mawduuc</option>
                        <option value="general">Weydiin Guud</option>
                        <option value="services">Adeegyada Caafimaadka </option>
                        <option value="careers">Shaqo</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Your Message</label>
                      <textarea
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900 placeholder:text-slate-300 resize-none"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={formState === "submitting"}
                      className="group w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-300 disabled:opacity-70 shadow-xl shadow-slate-200"
                    >
                      {formState === "submitting" ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Your Message</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Map Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="h-[500px] w-full rounded-[3rem] overflow-hidden relative shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop"
            alt="Map"
            className="w-full h-full object-cover grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="bg-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[280px]"
             >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-black text-blue-600 uppercase tracking-tighter text-lg">Gargaar Book</p>
                  <p className="text-xs font-bold text-slate-900">HARGAISA HEADQUARTERS</p>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;