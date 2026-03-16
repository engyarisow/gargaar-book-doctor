import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {

  const { atoken, getDashData, dashData, cancelAppointment } = useContext(AdminContext)

  const { slotDateFormat} =useContext(AppContext)

  useEffect(() => {
    if (atoken) {
      getDashData()
    }
  }, [atoken])

  return dashData && (
    <div className='m-5'>

      {/* Top Cards */}
      <div className='flex flex-wrap gap-3'>

        <div className='flex items-center gap-3 bg-white p-4 min-w-52 rounded border border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold'>{dashData?.doctors}</p>
            <p className='text-gray-500'>Doctors</p>
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
                src={item.docData.image}
                alt=""
              />

              <div className='flex-1 text-sm'>
                <p className='font-medium'>{item.docData.name}</p>
                <p className='text-gray-500'>{slotDateFormat(item.slotDate)}</p>
              </div>

              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className='w-8 cursor-pointer'
                  src={assets.cancel_icon}
                  alt=""
                />
              )}

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}

export default Dashboard