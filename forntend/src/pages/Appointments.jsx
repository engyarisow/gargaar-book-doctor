import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointments = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  // 1. Fetch official Doctor data
  const fetchDocInfo = () => {
    const docData = doctors.find(doc => doc._id.toString() === docId);
    setDocInfo(docData || null);
  };

  // 2. Generate time slots (6 AM to 11:59 PM daily)
  const getAvailableSlots = () => {
    if (!docInfo) return;

    const slots = [];
    const today = new Date(); 

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let startHour = 6;
      let endHour = 23;

      const startDateTime = new Date(currentDate);
      startDateTime.setHours(startHour, 0, 0, 0);

      const endDateTime = new Date(currentDate);
      endDateTime.setHours(endHour, 59, 59, 999);

      const daySlots = [];
      let slotTimeIter = new Date(startDateTime);

      while (slotTimeIter <= endDateTime) {
        if (slotTimeIter > new Date()) {
          const formattedTime = slotTimeIter.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          const year = slotTimeIter.getFullYear();
          const month = String(slotTimeIter.getMonth() + 1).padStart(2, '0');
          const day = String(slotTimeIter.getDate()).padStart(2, '0');
          const slotDateKey = `${year}-${month}-${day}`;

          const isBooked = docInfo.slots_booked?.[slotDateKey]?.includes(formattedTime);

          daySlots.push({
            datetime: new Date(slotTimeIter),
            time: formattedTime,
            booked: isBooked || false
          });
        }
        slotTimeIter.setMinutes(slotTimeIter.getMinutes() + 30);
      }

      if (daySlots.length > 0) slots.push(daySlots);
    }

    setDocSlots(slots);

    let foundDefault = false;
    for (let daySlots of slots) {
      const firstFree = daySlots.find(s => !s.booked);
      if (firstFree) {
        setSlotIndex(slots.indexOf(daySlots));
        setSlotTime(firstFree.time);
        foundDefault = true;
        break;
      }
    }
    
    if (!foundDefault) setSlotTime('');
  };

  // 3. Clinic Booking (Pay via Stripe)
  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Please login to your account to book an appointment');
      return navigate('/login');
    }
    if (!slotTime) {
      toast.warn('Please select a time slot');
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const slotDate = `${year}-${month}-${day}`;

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success && data.session_url) {
        window.location.replace(data.session_url);
      } else {
        toast.error(data.message || 'An error occurred');
        getDoctorsData();
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during the clinic booking process');
    }
  };

  // 4. Online Consultation Booking (Pay via Stripe)
  const bookConsultation = async () => {
    if (!token) {
      toast.warn('Please login to your account to book a consultation');
      return navigate('/login');
    }
    if (!slotTime) {
      toast.warn('Please select a time slot');
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const slotDate = `${year}-${month}-${day}`;

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-consultation`,
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success && data.session_url) {
        window.location.replace(data.session_url);
      } else {
        toast.error(data.message || 'An error occurred');
        getDoctorsData();
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during the consultation booking process');
    }
  };

  useEffect(() => { 
    fetchDocInfo(); 
  }, [doctors, docId]);
  
  useEffect(() => { 
    getAvailableSlots(); 
    const interval = setInterval(() => {
      getAvailableSlots();
    }, 60000); 
    return () => clearInterval(interval);
  }, [docInfo]);

  // Combined flag to check if booking should be disabled
  const isBookingDisabled = !slotTime || docInfo?.blocked || !docInfo?.available;

  return docInfo && (
    <div className='pb-20 max-w-5xl mx-auto'>
      
      {/* ⚠️ Warning: If the Doctor is blocked */}
      {docInfo.blocked && (
        <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-md mb-4 border border-red-200 flex items-center gap-2">
          <strong>⚠️ Account Blocked:</strong> {docInfo.blockReason || "Please contact administration."}
        </div>
      )}

      {/* ⚠️ Warning: If the Doctor is Unavailable */}
      {!docInfo.available && (
        <div className="bg-amber-50 text-amber-700 text-xs px-4 py-2 rounded-md mb-4 border border-amber-200 flex items-center gap-2">
          <strong>⚠️ Doctor Unavailable:</strong> The doctor is currently not accepting new appointments.
        </div>
      )}

      {/* Doctor Info Section */}
      <div className='flex flex-col sm:flex-row gap-5 bg-white border border-gray-200 rounded-xl p-5 shadow-sm'>
        
        {/* Doctor Image Container */}
        <div className="shrink-0 relative">
          <img 
            className='bg-primary w-28 h-28 sm:w-36 sm:h-36 rounded-lg object-cover shadow-sm' 
            src={docInfo.image} 
            alt={docInfo.name} 
          />
          {/* Availability Dot overlaying the image */}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${docInfo.available ? 'bg-green-500' : 'bg-red-500'}`} title={docInfo.available ? 'Available' : 'Unavailable'}></span>
        </div>

        {/* Doctor Info Details */}
        <div className='flex-1 flex flex-col justify-between'>
          
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div>
              <p className='flex items-center gap-2 text-xl font-bold text-gray-900'>
                {docInfo.name} <img className='w-4 h-4' src={assets.verified_icon} alt="Verified" />
              </p>
              <div className='flex items-center gap-2 text-xs mt-1 text-gray-600 font-medium'>
                <span>{docInfo.degree} - {docInfo.speciality}</span>
                <span className='py-0.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-[10px]'>{docInfo.experience} EXP</span>
              </div>
            </div>

            {/* Badges / Chips */}
            <div className="flex flex-col gap-1.5 items-end">
              {docInfo.ownerType === 'admin' ? (
                <span className="text-[10px] px-3 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                  Freelancer
                </span>
              ) : (
                <span className="text-[10px] px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 capitalize border border-emerald-100 flex items-center gap-1">
                  🏥 {docInfo.addedBy?.name || "Hospital Doctor"}
                </span>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="mt-3">
             <p className="text-[11px] text-gray-800 font-semibold mb-0.5">About Doctor</p>
             <p className="text-[11px] text-gray-500 leading-tight line-clamp-2 sm:line-clamp-3">
               {docInfo.about || 'No further details available.'}
             </p>
          </div>

          {/* Footer Row (Address & Fee) */}
          <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
            <div className="text-gray-600 flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               <span>{docInfo.address?.line1} {docInfo.address?.line2 ? `, ${docInfo.address.line2}` : ''}</span>
            </div>
            <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
               Fee: <span className='text-primary font-bold'>{currencySymbol}{docInfo.fees}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Time Selection Section (Booking Slots) */}
      <div className='mt-6 font-medium text-gray-700'>
        <p className='text-base font-semibold'>Select Booking Slot</p>

        {/* Days */}
        <div className='flex gap-2 items-center w-full overflow-x-scroll mt-3 pb-2 scrollbar-hide'>
          {docSlots.map((daySlots, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                setSlotIndex(idx);
                const firstFree = daySlots.find(s => !s.booked);
                setSlotTime(firstFree ? firstFree.time : '');
              }}
              className={`text-center py-3 min-w-[4rem] rounded-lg cursor-pointer transition-all duration-200 border ${
                slotIndex === idx ? 'bg-primary text-white border-primary shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <p className="text-[10px] font-bold">{daysOfWeek[daySlots[0].datetime.getDay()]}</p>
              <p className="text-sm font-semibold">{daySlots[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Hours */}
        <div className='flex items-center gap-2 w-full overflow-x-scroll mt-3 pb-2 scrollbar-hide'>
          {docSlots[slotIndex]?.map((slot, idx) => (
            <p 
              key={idx} 
              onClick={() => !slot.booked && setSlotTime(slot.time)}
              className={`px-4 py-1.5 text-xs rounded-md whitespace-nowrap transition-all duration-200 font-medium ${
                slot.booked 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through border border-gray-100' 
                  : slot.time === slotTime 
                    ? 'bg-primary text-white cursor-pointer shadow-sm border border-primary' 
                    : 'border border-gray-200 hover:bg-gray-50 cursor-pointer text-gray-600' 
              }`}
            >
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>

        {/* Booking & Payment Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 mt-6'>
          <button 
            onClick={bookAppointment} 
            disabled={isBookingDisabled}
            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm rounded-lg font-semibold transition-all duration-200 ${
              isBookingDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
            }`}
          >
             Book Visit
          </button>

          <button 
            onClick={bookConsultation} 
            disabled={isBookingDisabled}
            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm rounded-lg font-semibold transition-all duration-200 ${
              isBookingDisabled
                ? 'border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' 
                : 'border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-sm'
            }`}
          >
             Book Online 
          </button>
        </div>
      </div>

      {/* Related Doctors */}
      <div className="mt-8">
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    </div>
  );
};

export default Appointments;