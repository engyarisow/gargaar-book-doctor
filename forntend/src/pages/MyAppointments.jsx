import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      if (!token) return;
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAppointments(data.appointments);
      else toast.error(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments(); // refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const demoPay = async (appointmentId) => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/user/demo-pay`,
      { appointmentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      toast.success(data.message);
      getUserAppointments(); // refresh list
    } else {
      toast.error(data.message);
    }

  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || error.message);
  }
};

  useEffect(() => {
    if (token) getUserAppointments();
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointments</p>
      <div>
        {appointments.slice(0, 3).map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt={item.docData.name}
              />
            </div>

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{' '}
                {item.slotDate} | {item.slotTime}
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && (
                <button   onClick={() => demoPay(item._id)} className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                  Pay online
                </button>
              )}

              {!item.cancelled && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className={`text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded transition-all duration-300 hover:bg-red-600 hover:text-white`}
                >
                  Cancel Appointment
                </button>
              )}

              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 cursor-not-allowed">
                  Appointment Cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;