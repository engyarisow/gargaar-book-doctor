import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X, Clock, User } from 'lucide-react';

const Appeals = () => {
 
  const { atoken, backendUrl } = useContext(AdminContext);
  const [appeals, setAppeals] = useState([]);

  // ================= FETCH ALL APPEALS =================
  const fetchAppeals = async () => {
    try {
      if (!atoken) return;

      const { data } = await axios.get(backendUrl + '/api/admin/appeals', {
        headers: { Authorization: `Bearer ${atoken}` }
      });

      if (data.success) {
        setAppeals(data.appeals);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ================= HANDLE APPROVE / REJECT =================
  const handleStatus = async (appealId, status) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/admin/update-appeal', 
        { appealId, status }, 
        { headers: { Authorization: `Bearer ${atoken}` } }
      );

      if (data.success) {
        toast.success(`Appeal ${status} successfully!`);
        fetchAppeals(); // Refresh liiska ka dib marka la bedelo
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (atoken) fetchAppeals();
  }, [atoken]);

  return (
    <div className='m-5 w-full'>
      <h1 className='text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700'>
        <Clock className='text-blue-600' /> Doctor Appeals
      </h1>

      <div className='bg-white border rounded-xl overflow-hidden shadow-sm'>
        {/* Table Header */}
        <div className='hidden sm:grid grid-cols-[0.5fr_2.5fr_3.5fr_1fr_1fr] border-b py-3 px-6 bg-gray-50 text-sm font-bold text-gray-600'>
          <p>#</p>
          <p>Doctor Info</p>
          <p>Appeal Reason</p>
          <p>Status</p>
          <p>Action</p>
        </div>

        {/* Appeals List */}
        {appeals.length > 0 ? (
          appeals.map((item, index) => (
            <div key={index} className='flex flex-wrap sm:grid grid-cols-[0.5fr_2.5fr_3.5fr_1fr_1fr] items-center border-b py-4 px-6 hover:bg-gray-50 transition-all'>
              <p className='text-sm text-gray-400 font-medium'>{index + 1}</p>
              
              {/* Doctor Profile Image & Name */}
              <div className='flex items-center gap-3'>
                <div className='w-11 h-11 rounded-full border-2 border-blue-50 overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm'>
                  {item.doctorId?.image ? (
                    <img 
                      src={item.doctorId.image} 
                      alt={item.doctorId.name} 
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-blue-300'>
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className='overflow-hidden'>
                  <p className='font-bold text-gray-800 text-sm truncate'>{item.doctorId?.name || 'Unknown Doctor'}</p>
                  <p className='text-[11px] text-blue-600 font-medium uppercase tracking-tighter'>
                    {item.doctorId?.speciality || 'General'}
                  </p>
                </div>
              </div>

              {/* Appeal Reason */}
              <div className='pr-4'>
                <p className='text-sm text-gray-600 italic leading-relaxed line-clamp-2' title={item.reason}>
                  "{item.reason}"
                </p>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                  item.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                {item.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleStatus(item._id, 'approved')}
                      title="Approve Appeal"
                      className='p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white shadow-sm transition-all'
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleStatus(item._id, 'rejected')}
                      title="Reject Appeal"
                      className='p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white shadow-sm transition-all'
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='p-20 text-center'>
            <div className='flex justify-center mb-3 text-gray-200'>
                <Clock size={48} />
            </div>
            <p className='text-gray-400 font-medium'>No doctor appeals found at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appeals;