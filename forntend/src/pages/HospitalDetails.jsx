import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const HospitalDetails = () => { 
    const { hospitalId } = useParams();
    const { hospitals, doctors } = useContext(AppContext);
    const navigate = useNavigate();

    const [hospitalInfo, setHospitalInfo] = useState(null);
    const [hospitalDoctors, setHospitalDoctors] = useState([]);

    // 1. Fetch Hospital data
    const fetchHospitalData = () => {
        if (!hospitals || hospitals.length === 0) return;
        const hospitalData = hospitals.find(hosp => String(hosp._id) === String(hospitalId));
        setHospitalInfo(hospitalData || null);
    };

    // 2. Extract doctors specific to this hospital (matching by ID or Name)
    const fetchHospitalDoctors = () => {
        if (!doctors || doctors.length === 0 || !hospitalInfo) return;

        const filteredDocs = doctors.filter(doc => {
            // Check matching by ID
            const matchedById = 
                String(doc.addedBy?._id || doc.addedBy) === String(hospitalId) || 
                String(doc.hospital?._id || doc.hospital) === String(hospitalId);
            
            // Check matching by Name (owned by hospital name logic)
            const hospitalName = hospitalInfo.name.trim().toLowerCase();
            const doctorAddedBy = String(doc.addedBy?.name || doc.addedBy).trim().toLowerCase();
            const doctorHospital = String(doc.hospital?.name || doc.hospital).trim().toLowerCase();

            const matchedByName = (doctorAddedBy === hospitalName) || (doctorHospital === hospitalName);

            return matchedById || matchedByName;
        });

        setHospitalDoctors(filteredDocs);
    };

    useEffect(() => {
        fetchHospitalData();
    }, [hospitals, hospitalId]);

    useEffect(() => {
        if (hospitalInfo) {
            fetchHospitalDoctors();
        }
    }, [hospitalInfo, doctors]);

    if (!hospitalInfo) return <div className='p-20 text-center text-gray-500'>Loading...</div>;

    return (
        <div className='p-4 sm:p-0 font-sans'>
            {/* ---------- SECTION 1: HOSPITAL INFORMATION ---------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                {/* Hospital Image */}
                <div>
                    <img 
                        className='bg-primary w-full sm:max-w-72 rounded-3xl shadow-md object-cover h-64 sm:h-72' 
                        src={hospitalInfo.logo} 
                        alt={hospitalInfo.name} 
                    />
                </div>

                {/* Information Content Section */}
                <div className='flex-1 border border-gray-200 rounded-3xl p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 shadow-sm'>
                    
                    {/* Name & Verified Icon */}
                    <p className='flex items-center gap-2 text-3xl font-bold text-gray-900'>
                        {hospitalInfo.name || "Unnamed Hospital"} 
                        <img className='w-5' src={assets.verified_icon} alt="Verified" />
                    </p>

                    {/* Location Row */}
                    <p className='text-sm text-indigo-500 font-medium mt-1'>
                        📍 {hospitalInfo.location || hospitalInfo.address || "Location not set"}
                    </p>

                    {/* Details Row: Speciality & Since */}
                    <div className='mt-6 flex items-center justify-between text-sm border-y border-gray-100 py-4'>
                        <div>
                            <p className='text-gray-400 uppercase text-[10px] font-bold tracking-wider'>Speciality</p>
                            <p className='font-bold text-gray-700 mt-1'>
                                {Array.isArray(hospitalInfo.speciality) && hospitalInfo.speciality.length > 0 
                                    ? hospitalInfo.speciality[0] 
                                    : (hospitalInfo.speciality || 'General Hospital')}
                            </p>
                        </div>
                        <div className='text-right'>
                            <p className='text-gray-400 uppercase text-[10px] font-bold tracking-wider'>Since</p>
                            <p className='font-bold text-indigo-600 mt-1'>
                                {hospitalInfo.date ? new Date(hospitalInfo.date).getFullYear() : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className='mt-6'>
                        <p className='flex items-center gap-1 text-sm font-medium text-gray-900'>
                            About Hospital <img className='w-4' src={assets.info_icon} alt="Info" />
                        </p>
                        <p className='text-sm text-gray-500 max-w-[700px] mt-2 leading-relaxed'>
                            {hospitalInfo.about || "This hospital provides high-quality healthcare services with state-of-the-art medical technology."}
                        </p>
                    </div>

                    {/* Contact Phone */}
                    {hospitalInfo.phone && (
                        <p className='text-gray-500 font-medium mt-4 text-sm'>
                            Contact: <span className='text-gray-900 font-semibold'>{hospitalInfo.phone}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* ---------- SECTION 2: HOSPITAL DOCTORS LIST ---------- */}
            <div className='mt-16 text-gray-900'>
                <div className='flex flex-col items-center gap-2 mb-10'>
                    <h2 className='text-3xl font-bold'>Hospital Doctors</h2>
                    <p className='sm:w-1/2 text-center text-sm text-gray-600'>
                        Choose one of the specialist doctors working at this hospital to book an appointment.
                    </p>
                </div>

                <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-4'>
                    {hospitalDoctors.length > 0 ? (
                        hospitalDoctors.map((item, index) => (
                            <div 
                                key={index}
                                onClick={() => { navigate(`/appointments/${item._id}`); window.scrollTo(0, 0); }} 
                                className='bg-white rounded-3xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300'
                            >
                                {/* Doctor Image & Available Badge */}
                                <div className='h-64 bg-gray-100 relative overflow-hidden'>
                                    <img 
                                        className='w-full h-full object-cover transition-transform duration-500 hover:scale-105' 
                                        src={item.image} 
                                        alt={item.name} 
                                    />
                                    <div className='absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-green-600 flex items-center gap-2'>
                                        <span className='w-2 h-2 bg-green-600 rounded-full'></span>
                                        Available
                                    </div>
                                </div>

                                {/* Doctor Content */}
                                <div className='p-6'>
                                    <p className='text-lg font-bold text-gray-900 mb-1'>{item.name}</p>
                                    <p className='text-indigo-500 uppercase text-xs mb-3 font-medium'>{item.speciality}</p>
                                    
                                    <div className='flex justify-between text-sm border-t pt-3 text-gray-500'>
                                        <div>
                                            Experience <br />
                                            <span className='text-gray-900 font-semibold'>{item.experience}</span>
                                        </div>
                                        <div className='text-right'>
                                            Fee <br />
                                            <span className='text-gray-900 font-semibold'>${item.fees}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='col-span-full py-20 text-center'>
                            <p className='text-gray-400 italic font-medium'>No doctors are currently available at this hospital.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalDetails;