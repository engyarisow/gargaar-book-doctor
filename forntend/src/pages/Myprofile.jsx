import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  if (!userData) return null;

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone || '');
      formData.append('address', JSON.stringify(userData.address || {}));
      formData.append('gender', userData.gender || '');
      formData.append('dob', userData.dob || '');
      if (image) formData.append('image', image);

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className='px-4 sm:px-[10%] py-10'>
      <div className='max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden'>
        
        {/* Header / Avatar */}
        <div className='h-32 bg-primary relative'>
          <div className='absolute -bottom-12 left-8 border-4 border-white rounded-2xl overflow-hidden bg-white flex items-center justify-center cursor-pointer'>
            {isEdit ? (
              <label>
                {image ? (
                  <img className='w-32 h-32 object-cover' src={URL.createObjectURL(image)} alt="Profile" />
                ) : userData.image ? (
                  <img className='w-32 h-32 object-cover' src={userData.image} alt="Profile" />
                ) : (
                  <div className='w-32 h-32 flex items-center justify-center bg-blue-500 text-white text-6xl font-bold'>
                    {getInitial(userData.name)}
                  </div>
                )}
                <input
                  type="file"
                  className='hidden'
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>
            ) : userData.image ? (
              <img className='w-32 h-32 object-cover' src={userData.image} alt="Profile" />
            ) : (
              <div className='w-32 h-32 flex items-center justify-center bg-blue-500 text-white text-6xl font-bold'>
                {getInitial(userData.name)}
              </div>
            )}
          </div>
        </div>

        <div className='pt-16 p-8'>
          {/* Name and Edit Button */}
          <div className='flex justify-between items-start mb-8'>
            <div>
              {isEdit ? (
                <input
                  className='text-3xl font-display font-bold text-slate-800 border-b border-slate-300 pb-1'
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <h1 className='text-3xl font-display font-bold text-slate-800'>{userData.name}</h1>
              )}
              <p className='text-slate-500 flex items-center gap-1 mt-1'>
                <Mail size={14} /> {userData.email}
              </p>
            </div>

            <button
              onClick={() => setIsEdit(!isEdit)}
              className='flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all font-medium text-sm'
            >
              {isEdit ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Profile</>}
            </button>
          </div>

          {/* Info Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>

            {/* Contact Info */}
            <div className='space-y-6'>
              <p className='text-slate-400 uppercase tracking-wider text-xs font-bold border-b border-slate-100 pb-2'>
                Contact Information
              </p>
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary'>
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>Email Address</p>
                    <p className='text-sm font-medium'>{userData.email}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary'>
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>Phone Number</p>
                    {isEdit ? (
                      <input
                        type="text"
                        value={userData.phone || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                        className='bg-gray-50 text-sm'
                      />
                    ) : (
                      <p className='text-sm font-medium'>{userData.phone || '+1 212 456 7890'}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary'>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>Address</p>
                    {isEdit ? (
                      <div className='space-y-1'>
                        <input
                          className='bg-gray-50 w-full'
                          type="text"
                          value={userData.address?.line1 || ''}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            address: { ...prev.address, line1: e.target.value }
                          }))}
                        />
                        <input
                          className='bg-gray-50 w-full'
                          type="text"
                          value={userData.address?.line2 || ''}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            address: { ...prev.address, line2: e.target.value }
                          }))}
                        />
                      </div>
                    ) : (
                      <p className='text-sm font-medium'>
                        {userData.address?.line1 || '123 Medical Plaza'}
                        <br />
                        {userData.address?.line2 || 'New York, NY'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className='space-y-6'>
              <p className='text-slate-400 uppercase tracking-wider text-xs font-bold border-b border-slate-100 pb-2'>
                Basic Information
              </p>
              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary'>
                    <User size={16} />
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>Gender</p>
                    <p className='text-sm font-medium'>{userData.gender || 'Male'}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary'>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>Birthday</p>
                    <p className='text-sm font-medium'>{userData.dob || 'July 20, 1995'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEdit && (
            <div className='mt-10 flex justify-end'>
              <button
                onClick={updateUserProfileData}
                className='btn-primary flex items-center gap-2'
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;