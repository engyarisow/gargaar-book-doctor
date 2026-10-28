import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();
  const [relDoc, setRelDocs] = useState([]);

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      // Halkan waxaan ku darnay shuruudaha (Approved & Not Blocked)
      const doctorsData = doctors.filter(
        (doc) => 
          doc.speciality === speciality && 
          doc._id !== docId && 
          doc.status === 'Approved' && 
          doc.blocked !== true
      );
      setRelDocs(doctorsData);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className='flex flex-col items-center gap-6 my-16 text-gray-900 md:mx-10 font-sans'>

      <h1 className='text-3xl font-bold'>Related Doctors</h1>
      <p className='sm:w-1/2 text-center text-sm text-gray-600'>Simply browse through our extensive list of trusted doctors.</p>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8'>
        {relDoc.slice(0,5).map(item => (
          <div
            key={item._id}
            onClick={() => { navigate(`/appointments/${item._id}`); scrollTo(0, 0); }}
            className='bg-white rounded-3xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300'
          >

            <div className='h-64 bg-gray-100 relative overflow-hidden'>
              <img src={item.image} alt={item.name} className='w-full h-full object-cover transition-transform duration-500 hover:scale-105' />
              
              {/* AVAILABLE / NOT AVAILABLE LOGIC */}
              <div className={`absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-600' : 'bg-red-500'}`}></span>
                {item.available ? 'Available' : 'Not Available'}
              </div>
            </div>

            <div className='p-6'>
              <p className='text-lg font-bold text-gray-900 mb-1'>{item.name}</p>
              <p className='text-indigo-500 uppercase text-xs mb-3'>{item.speciality}</p>
              <div className='flex justify-between text-sm border-t pt-3 text-gray-500'>
                <div>Experience <br /><span className='text-gray-900 font-semibold'>{item.experience}</span></div>
                <div>Fee <br /><span className='text-gray-900 font-semibold'>${item.fees}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { navigate('/doctors'); scrollTo(0,0); }}
        className='bg-indigo-500 text-white px-12 py-3 rounded-full mt-10 shadow-md hover:shadow-lg hover:bg-indigo-600 transition-all'
      >More</button>

    </div>
  );
};

export default RelatedDoctors;