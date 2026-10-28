import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TopHospitals = () => {
  const navigate = useNavigate();
  // Ka soo saar hospitals iyo getHospitalsData Context-ka
  const { hospitals, getHospitalsData } = useContext(AppContext);

  // Soo kici xogta marka bogga la load-gareeyo
  useEffect(() => {
    if (getHospitalsData) {
      getHospitalsData();
    }
  }, [getHospitalsData]);

  return (
    <div className='flex flex-col items-center gap-6 my-16 text-gray-900 md:mx-10 font-sans'>

      <h1 className='text-3xl font-bold'>Top Hospitals </h1>
      <p className='sm:w-1/2 text-center text-sm text-gray-600'>Explore our highly-rated hospitals and specialized medical centers near you.</p>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8'>
        {hospitals && hospitals.slice(0, 10).map((item) => (
          <div
            key={item._id}
            // U wareeji bogga faahfaahinta isbitaalka (Hubi in route-kan uu jiro)
            onClick={() => navigate(`/hospital-details/${item._id}`)}
            className='bg-white rounded-3xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300'
          >

            {/* Sawirka Isbitaalka */}
            <div className='h-64 bg-gray-100 relative overflow-hidden'>
              <img 
                src={item.logo} 
                alt={item.name} 
                className='w-full h-full object-cover transition-transform duration-500 hover:scale-105' 
              />
              <div className='absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-2'>
                <span className='w-2 h-2 bg-blue-600 rounded-full'></span>
                24/7 Emergency
              </div>
            </div>

            {/* Xogta Isbitaalka */}
            <div className='p-6'>
              <p className='text-lg font-bold text-gray-900 mb-1'>{item.name}</p>
              
              {/* Nooca Isbitaalka ama Takhasuska */}
              <p className='text-indigo-500 uppercase text-xs mb-3 font-semibold'>
                {Array.isArray(item.speciality) ? item.speciality.join(', ') : (item.speciality || 'General Hospital')}
              </p>

              <div className='flex justify-between text-sm border-t pt-3 text-gray-500'>
                <div className='flex-1'>
                    Location <br />
                    <span className='text-gray-900 font-semibold truncate block w-40'>
                        {item.address || item.location || "Not specified"}
                    </span>
                </div>
                <div className='text-right'>
                    Status <br />
                    <span className='text-gray-900 font-semibold'>{item.blocked ? 'Full' : 'Available'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      

    </div>
  );
};

export default TopHospitals;