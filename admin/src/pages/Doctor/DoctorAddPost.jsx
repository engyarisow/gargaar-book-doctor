import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { 
  Image as ImageIcon, X, Globe, Lock, Send, 
  Loader2, User2, AlertCircle, Video, Smile
} from "lucide-react";

const postSchema = z.object({
  title: z.string().min(3, "Title too short").max(100),
  content: z.string().min(5, "Content is too short").max(5000),
  isPublic: z.boolean().default(true),
});

const DoctorAddPost = () => {
  // CHANGED: Using profileData and getProfileData from your context
  const { createPost, profileData, getProfileData } = useContext(DoctorContext); 
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Trigger profile fetch if data is missing
  useEffect(() => {
    if (!profileData) {
      getProfileData();
    }
  }, [profileData]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { isPublic: true, title: "", content: "" }
  });

  const isPublic = watch("isPublic");

  const handleFile = (file) => {
    if (file?.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("isPublic", data.isPublic);
    if (image) formData.append("image", image);

    try {
      await createPost(formData);
      reset(); setImage(null); setPreview(null);
    } catch (err) { 
      console.error(err); 
    }
  };

  return (
    <div className="max-w-[550px] mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-900 text-center flex-1 ml-8">Create post</h2>
          <div onClick={() => reset()} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer">
            <X size={20} className="text-gray-600" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          {/* Identity Section - Now correctly using profileData */}
          <div className="flex items-center gap-3 mb-4">
            {profileData?.image ? (
              <img 
                src={profileData.image} 
                className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                alt="Doctor"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <User2 size={28} />
              </div>
            )}
            
            <div className="flex flex-col text-left">
              <span className="font-bold text-[16px] text-slate-800 leading-tight">
                {profileData?.name || "Dr. Medical Professional"}
              </span>
              <button 
                type="button"
                onClick={() => setValue("isPublic", !isPublic)}
                className="flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 rounded-md text-[12px] font-bold text-gray-600 border border-gray-200"
              >
                {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                <span>{isPublic ? "Public" : "Private"}</span>
                <span className="text-[10px] ml-0.5 opacity-50">▼</span>
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-2 mb-4">
            <input
              {...register("title")}
              placeholder="Subject / Case Name"
              className="w-full text-[19px] font-bold text-slate-900 border-none focus:ring-0 p-0"
            />
            <textarea
              {...register("content")}
              placeholder={`What's on your mind, Dr. ${profileData?.name?.split(' ')[1] || 'Doctor'}?`}
              className="w-full min-h-[120px] text-[16px] text-slate-700 border-none focus:ring-0 p-0 resize-none leading-relaxed"
            />
          </div>

          {/* Image Preview */}
          <AnimatePresence>
            {preview && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mb-4 rounded-lg overflow-hidden border">
                <img src={preview} className="w-full h-auto max-h-[300px] object-cover" />
                <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white">
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Facebook Style Toolbar */}
          <div className="border border-gray-200 rounded-xl p-3 mb-4 flex items-center justify-between bg-gray-50/30">
            <span className="text-[14px] font-bold text-gray-500">Add to your post</span>
            <div className="flex items-center gap-1">
              <label className="p-2 hover:bg-gray-200 rounded-full cursor-pointer text-[#45BD62]">
                <ImageIcon size={26} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
              </label>
              <div className="p-2 hover:bg-gray-200 rounded-full text-[#F7B928]"><Smile size={26} /></div>
              <div className="p-2 hover:bg-gray-200 rounded-full text-[#F02849]"><Video size={26} /></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg font-bold text-[16px] bg-[#1B74E4] hover:bg-[#1565C0] text-white transition-all disabled:bg-gray-200 disabled:text-gray-400"
          >
            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Post"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorAddPost;