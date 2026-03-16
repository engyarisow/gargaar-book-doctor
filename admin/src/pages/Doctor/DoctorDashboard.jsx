import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData ,cancelAppointments,completeAppointments} = useContext(DoctorContext)
  const {currency, slotDateFormat} =useContext(AppContext)

  useEffect(() => {
    if (dToken) getDashData()
  }, [dToken]) 
  return  dashData && (
    <div>
          <div className='flex flex-wrap gap-3'>

        <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold'>{currency} {dashData?.earnings}</p>
            <p className='text-gray-500'>Earnings</p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold'>{dashData?.appointments}</p>
            <p className='text-gray-500'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold'>{dashData?.patients}</p>
            <p className='text-gray-500'>Patients</p>
          </div>
        </div>

      </div>
      
      {/* Latest Bookings */}
      <div className='bg-white mt-10 rounded border'>

        <div className='flex items-center gap-2 px-4 py-3 border-b'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-2'>

          {dashData?.latestAppointments?.map((item, index) => (

            <div  className='flex items-center gap-3 px-6 py-3 border-b hover:bg-gray-100' key={index} >

              <img
                className='rounded-full w-10'
                src={item.userData.image}
                alt=""
              />

              <div className='flex-1 text-sm'>
                <p className='font-medium'>{item.userData.name}</p>
                <p className='text-gray-500'>{slotDateFormat(item.slotDate)}</p>
              </div>

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
     
    </div>
  )
}

export default DoctorDashboard