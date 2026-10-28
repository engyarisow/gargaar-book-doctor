import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { HospitalContext } from '../../context/HospitalContext'
import { toast } from 'react-toastify'

const AddDoctor = () => {
  // States ee foomka
  const [docImg, setDocImg] = useState(false)
  const [docCert, setDocCert] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  // Ka soo saar addDoctor iyo hToken Context-ka
  // Waxaan u isticmaalaynaa addDoctor si uu u xaliyo dhibaatada Authorization-ka
  const { addDoctor, hToken } = useContext(HospitalContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    
    try {
      // Hubinta Login-ka
      if (!hToken) {
        return toast.error("Fadlan login samee markale (Token missing)")
      }

      // Hubinta sawirada
      if (!docImg || !docCert) {
        return toast.error("Fadlan xulo sawirka iyo shahaadada")
      }

      // Diyaarinta xogta la dirayo
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

      // U dir xogta function-ka Context-ka
      const success = await addDoctor(formData)

      if (success) {
        // Haddii lagu guulaysto, faaruqi foomka
        setDocImg(false)
        setDocCert(false)
        setName('')
        setEmail('')
        setPassword('')
        setFees('')
        setAbout('')
        setDegree('')
        setAddress1('')
        setAddress2('')
        setExperience('1 Year')
        setSpeciality('General physician')
      }

    } catch (error) {
      toast.error("Khalad ayaa dhacay intii lagu guda jiray diiwaangelinta")
      console.error(error)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-4 text-lg font-medium'>Add New Doctor (Hospital Panel)</p>
      
      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll shadow-sm'>
        
        {/* Profile Picture Upload Section */}
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img 
              className='w-16 h-16 bg-gray-100 rounded-full cursor-pointer object-cover' 
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} 
              alt="Profile" 
            />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>Upload Doctor <br /> Picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          
          {/* Left Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div>
              <p>Doctor Name</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder='Full Name' className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' />
            </div>
            
            <div>
              <p>Email</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='Email Address' className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' />
            </div>

            <div>
              <p>Password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder='Create Password' className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' />
            </div>

            <div>
              <p>Fees</p>
              <input type="number" value={fees} onChange={(e) => setFees(e.target.value)} required placeholder='e.g. 20' className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' />
            </div>
          </div>

          {/* Right Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div>
              <p>Speciality</p>
              <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400 cursor-pointer'>
                <option value="General physician">General physician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pediatricians">Pediatricians</option>
              </select>
            </div>

            <div>
              <p>Experience</p>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400 cursor-pointer'>
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>
            
            <div className='flex flex-col gap-1'>
              <p>Education / Degree</p>
              <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} required placeholder='e.g. MBBS' className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' />
              
              {/* Certificate Section */}
              <div className='mt-2 bg-gray-50 p-3 border border-dashed rounded-lg'>
                <p className='text-xs font-medium mb-1 text-blue-600'>Upload Degree Certificate</p>
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
              <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder='Address line 1' required className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' />
              <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder='Address line 2' required className='w-full border rounded px-3 py-2 mt-2 outline-none focus:border-blue-400' />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className='mt-6'>
          <p>About Doctor</p>
          <textarea 
            rows={5} 
            value={about} 
            onChange={(e) => setAbout(e.target.value)} 
            required 
            placeholder='Write a short description about the doctor...' 
            className='w-full border rounded px-3 py-2 mt-1 outline-none focus:border-blue-400' 
          />
        </div>

        <button 
          type="submit" 
          className='mt-8 bg-blue-600 text-white px-10 py-3 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95'
        >
          Add Doctor
        </button>
      </div>
    </form>
  )
}

export default AddDoctor