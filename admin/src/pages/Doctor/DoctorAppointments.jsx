import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from '../../assets/assets';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointments, cancelAppointments } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        {/* Table Header */}
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Appointments List */}
        {[...appointments].reverse().map((item, index) => (
          <div
            key={item._id} // better to use unique id
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center border-b hover:text-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>

            {/* Patient Info */}
            <div className="flex items-center gap-2">
              <img className="w-8 h-8 rounded-full" src={item.userData.image} alt={item.userData.name} />
              <p>{item.userData.name}</p>
            </div>

            {/* Payment Type */}
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? 'Online' : 'Cash'}
              </p>
            </div>

            {/* Age */}
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>

            {/* Slot Date & Time */}
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            {/* Fees */}
            <p>{currency}{item.amount}</p>

            {/* Actions */}
            {item.cancelled ? (
              <p className="text-red-500 font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 font-medium">Completed</p>
            ) : (
              <div className="flex gap-2">
                <img
                  onClick={() => cancelAppointments(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt="Cancel"
                />
                <img
                  onClick={() => completeAppointments(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt="Complete"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;