import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

// Liiska Takhasusyada
const specialityOptions = [
    "General Medicine", "Surgery", "Cardiology", "Dental", "Pediatrics", 
    "Gynecology", "Dermatology", "Neurology", "Orthopedics", "Ophthalmology",
    "Urology", "Oncology", "Psychiatry", "Radiology", "ENT (Ear, Nose, Throat)",
    "Physiotherapy", "Gastroenterology", "Endocrinology", "Hematology", "Nephrology",
    "Emergency Medicine", "Infectious Diseases", "Anesthesiology", "Pathology", "Dermatopathology",
    "Pulmonology", "Rheumatology", "Vascular Surgery", "Plastic Surgery", "Neurosurgery",
    "Cardiothoracic Surgery", "Oral Surgery", "Maxillofacial Surgery", "Family Medicine", "Intensive Care",
    "Rehabilitation", "Sports Medicine", "Geriatrics", "Neonatology", "Immunology"
];

const AddHospital = () => {
    // States
    const [logo, setLogo] = useState(false)
    const [license, setLicense] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [location, setLocation] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('')

    const { backendUrl, atoken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {
            if (!logo || !license) {
                return toast.error("Fadlan xulo Logo-ga iyo Shahaadada (License)")
            }
            if (!speciality) {
                return toast.error("Fadlan dooro takhasuska cisbitaalka")
            }

            const formData = new FormData()
            
            // Files
            formData.append("image", logo) 
            formData.append("certificate", license) 
            
            // Text data
            formData.append("name", name)
            formData.append("email", email)
            formData.append("password", password)
            formData.append("location", location)
            formData.append("about", about)
            formData.append("speciality", JSON.stringify([speciality])) 

            const { data } = await axios.post(backendUrl + "/api/admin/register-hospital", formData, {
                headers: { Authorization: `Bearer ${atoken}` }
            })

            if (data.success) {
                toast.success(data.message)
                // Reset Form
                setLogo(false); setLicense(false); setName(''); setEmail(''); setPassword('');
                setLocation(''); setAbout(''); setSpeciality('');
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Khalad ayaa dhacay")
            console.error(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-4 text-xl font-semibold text-gray-700 uppercase tracking-wide'>Diiwaangeli Hospital Cusub</p>
            
            <div className='bg-white px-8 py-8 border rounded-xl w-full max-w-4xl shadow-md overflow-y-auto max-h-[85vh]'>
                
                {/* 1. Upload Logo (Top Section) */}
                <div className='flex flex-col items-start gap-2 mb-8 border-b pb-6'>
                    <p className='text-sm font-medium text-gray-500'>Hospital Logo</p>
                    <label htmlFor="logo">
                        <img className='w-24 h-24 bg-gray-50 rounded-lg cursor-pointer object-cover border-2 border-dashed border-primary/30 hover:border-primary transition-all' 
                             src={logo ? URL.createObjectURL(logo) : assets.upload_area} alt="Logo" />
                    </label>
                    <input onChange={(e) => setLogo(e.target.files[0])} type="file" id="logo" hidden />
                </div>

                {/* 2. Form Inputs Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-600'>
                    
                    {/* Qaybta Bidix */}
                    <div className='flex flex-col gap-4'>
                        <div>
                            <p className='font-medium text-sm text-gray-700'>Hospital Name</p>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder='Tusaale: Gargaar Hospital' className='w-full border rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary outline-none transition-all' />
                        </div>
                        <div>
                            <p className='font-medium text-sm text-gray-700'>Email (Login Access)</p>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='hospital@example.com' className='w-full border rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary outline-none transition-all' />
                        </div>
                        <div>
                            <p className='font-medium text-sm text-gray-700'>Password</p>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder='••••••••' className='w-full border rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary outline-none transition-all' />
                        </div>
                    </div>

                    {/* Qaybta Midig */}
                    <div className='flex flex-col gap-4'>
                        <div>
                            <p className='font-medium text-sm text-gray-700'>Location </p>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder='Hargeisa, Somaliland' className='w-full border rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary outline-none transition-all' />
                        </div>

                        {/* License Upload (Moved here and Styled) */}
                        <div>
                            <p className='font-medium text-sm text-gray-700'>Upload License / Permit</p>
                            <input 
                                onChange={(e) => setLicense(e.target.files[0])} 
                                type="file" 
                                required 
                                className='w-full border rounded-lg px-3 py-[5.5px] mt-1 bg-gray-50 cursor-pointer text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-opacity-90 outline-none transition-all'
                            />
                        </div>

                        <div>
                            <p className='font-medium text-sm text-gray-700'> Speciality</p>
                            <select 
                                onChange={(e) => setSpeciality(e.target.value)} 
                                value={speciality} 
                                required 
                                className='w-full border rounded-lg px-3 py-2 mt-1 bg-white cursor-pointer focus:ring-1 focus:ring-primary outline-none transition-all'
                            >
                                <option value="" disabled>-- Dooro Takhasuska --</option>
                                {specialityOptions.sort().map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className='mt-6'>
                    <p className='font-medium text-sm text-gray-700'>About Hospital / Description</p>
                    <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} required placeholder='Ka sheekee adeegyada uu bixiyo cisbitaalku...' className='w-full border rounded-lg px-3 py-2 mt-1 focus:ring-1 focus:ring-primary outline-none transition-all' />
                </div>

                {/* Submit Button */}
                <div className='flex justify-start items-center mt-10'>
                    <button type="submit" className='bg-primary text-white px-12 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95'>
                        Register Hospital
                    </button>
                </div>
            </div>
        </form>
    )
}

export default AddHospital