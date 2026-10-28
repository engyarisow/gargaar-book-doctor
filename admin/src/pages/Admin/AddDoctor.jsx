import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [docCert, setDocCert] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year') // Default experience
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const { backendUrl, atoken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if (!docImg || !docCert) return toast.error("Fadlan xulo sawirka iyo shahaadada labadaba")

      const formData = new FormData()
      formData.append("image", docImg)
      formData.append("certificate", docCert)
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("experience", experience)
      formData.append("fees", Number(fees))
      formData.append("about", about)
      formData.append("speciality", speciality)
      formData.append("degree", degree)
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }))

      const { data } = await axios.post(backendUrl + "/api/admin/add-doctor", formData, {
        headers: { Authorization: `Bearer ${atoken}` }
      })

      if (data.success) {
        toast.success(data.message)
        // Reset Form
        setDocImg(false)
        setDocCert(false)
        setName('')
        setEmail('')
        setPassword('')
        setExperience('1 Year')
        setFees('')
        setAbout('')
        setDegree('')
        setAddress1('')
        setAddress2('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Khalad ayaa dhacay")
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-4 text-lg font-medium'>Add New Doctor (Admin Panel)</p>
      
      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll shadow-sm'>
        
        {/* Profile Picture */}
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-16 h-16 bg-gray-100 rounded-full cursor-pointer object-cover' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="Upload area" />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>Upload Doctor <br /> Picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          
          {/* Left Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div>
              <p>Doctor Name</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className='w-full border rounded px-3 py-2 mt-1' />
            </div>
            <div>
              <p>Email</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className='w-full border rounded px-3 py-2 mt-1' />
            </div>
            <div>
              <p>Password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className='w-full border rounded px-3 py-2 mt-1' />
            </div>
            
            {/* Experience Dropdown (Halkan ayaa lagu daray) */}
            <div>
              <p>Experience</p>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className='w-full border rounded px-3 py-2 mt-1'>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="4 Years">4 Years</option>
                <option value="5 Years">5 Years</option>
                <option value="6 Years">6 Years</option>
                <option value="7 Years">7 Years</option>
                <option value="8 Years">8 Years</option>
                <option value="9 Years">9 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>

            <div>
              <p>Fees</p>
              <input type="number" value={fees} onChange={(e) => setFees(e.target.value)} required className='w-full border rounded px-3 py-2 mt-1' />
            </div>
          </div>

          {/* Right Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div>
              <p>Speciality</p>
              <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} className='w-full border rounded px-3 py-2 mt-1'>
                <option value="General physician">General physician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            
            {/* Degree & Certificate Section */}
            <div className='flex flex-col gap-1'>
              <p>Education / Degree</p>
              <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} required className='w-full border rounded px-3 py-2 mt-1' placeholder='e.g. MBBS' />
              
              <div className='mt-2 bg-gray-50 p-3 border border-dashed rounded'>
                <p className='text-xs font-medium mb-1'>Upload Degree Certificate </p>
                <input 
                  onChange={(e) => setDocCert(e.target.files[0])} 
                  type="file" 
                  required 
                  className='text-xs w-full cursor-pointer'
                />
              </div>
            </div>

            <div>
              <p>Address</p>
              <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder='Address line 1' required className='w-full border rounded px-3 py-2 mt-1' />
              <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder='Address line 2' required className='w-full border rounded px-3 py-2 mt-2' />
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <p>About Doctor</p>
          <textarea rows={5} value={about} onChange={(e) => setAbout(e.target.value)} required className='w-full border rounded px-3 py-2 mt-1' placeholder='Write about the doctor...' />
        </div>

        <button type="submit" className='mt-8 bg-primary text-white px-10 py-3 rounded-full hover:bg-opacity-90 transition-all'>
          Add Doctor
        </button>
      </div>
    </form>
  )
}

export default AddDoctor