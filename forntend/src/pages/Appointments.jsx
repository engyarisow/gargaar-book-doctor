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
  const daysOfWeek = ['SU', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  // Fetch doctor info
  const fetchDocInfo = () => {
    const docData = doctors.find(doc => doc._id.toString() === docId);
    setDocInfo(docData || null);
  };

  // Generate 7-day slots
  const getAvailableSlots = () => {
    if (!docInfo) return;

    const slots = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const startHour = 10;
      const endHour = 21;

      const startDateTime = new Date(currentDate);
      if (i === 0) {
        const now = new Date();
        startDateTime.setHours(now.getHours());
        startDateTime.setMinutes(now.getMinutes() < 30 ? 30 : 0);
        if (startDateTime < now) startDateTime.setHours(startDateTime.getHours() + 1);
      } else {
        startDateTime.setHours(startHour, 0, 0, 0);
      }

      const endDateTime = new Date(currentDate);
      endDateTime.setHours(endHour, 0, 0, 0);

      const daySlots = [];
      let slotTimeIter = new Date(startDateTime);

      while (slotTimeIter <= endDateTime) {
        const formattedTime = slotTimeIter.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const slotDateKey = slotTimeIter.toISOString().split('T')[0];
        const isBooked = docInfo.slots_booked?.[slotDateKey]?.includes(formattedTime);

        daySlots.push({ datetime: new Date(slotTimeIter), time: formattedTime, booked: isBooked || false });
        slotTimeIter.setMinutes(slotTimeIter.getMinutes() + 30);
      }

      if (daySlots.length > 0) slots.push(daySlots);
    }

    setDocSlots(slots);
    // Set first available slot as default
    for (let daySlots of slots) {
      const firstFree = daySlots.find(s => !s.booked);
      if (firstFree) {
        setSlotIndex(slots.indexOf(daySlots));
        setSlotTime(firstFree.time);
        break;
      }
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment');
      return navigate('/login');
    }
    if (!slotTime) {
      toast.warn('Select a time slot first');
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      const slotDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message); // "This slot is not available, please choose another"
        getDoctorsData(); // refresh slots
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong while booking');
    }
  };

  useEffect(() => { fetchDocInfo(); }, [doctors, docId]);
  useEffect(() => { getAvailableSlots(); }, [docInfo]);

  return docInfo && (
    <div>
      {/* Doctor Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-t-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              about <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Slots */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>booking slot</p>

        {/* Days */}
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.map((daySlots, idx) => (
            <div key={idx} onClick={() => {
                setSlotIndex(idx);
                const firstFree = daySlots.find(s => !s.booked);
                setSlotTime(firstFree ? firstFree.time : '');
              }}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === idx ? 'bg-primary text-white' : 'border border-gray-200'}`}>
              <p>{daysOfWeek[daySlots[0].datetime.getDay()]}</p>
              <p>{daySlots[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Times */}
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots[slotIndex]?.map((slot, idx) => (
            <p key={idx} onClick={() => !slot.booked && setSlotTime(slot.time)}
              className={`text-sm font-light shrink-0 px-5 py-2 rounded-full cursor-pointer 
                ${slot.booked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : slot.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}>
              {slot.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button onClick={bookAppointment} disabled={!slotTime}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 disabled:opacity-50'>
          book an appointment
        </button>
      </div>

      {/* Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointments;