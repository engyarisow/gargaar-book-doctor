import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 year')
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
      if (!docImg) {
        return toast.error("Image not selected")
      }

      const formData = new FormData()
      formData.append("image", docImg)
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("experience", experience)
      formData.append("fees", Number(fees))
      formData.append("about", about)
      formData.append("speciality", speciality)
      formData.append("degree", degree)
      formData.append("address", JSON.stringify({
        line1: address1,
        line2: address2
      }))

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        {
          headers: {
            Authorization: `Bearer ${atoken}`
          }
        }
      )

      if (data.success) {
        toast.success(data.message)

        // Reset form after success
        setDocImg(false)
        setName('')
        setEmail('')
        setPassword('')
        setExperience('1 year')
        setFees('')
        setAbout('')
        setSpeciality('General physician')
        setDegree('')
        setAddress1('')
        setAddress2('')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-4 text-lg font-medium'>Add Doctor</p>

      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>

        {/* Upload Image */}
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img
              className='w-16 bg-gray-100 rounded-full cursor-pointer'
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt="Upload"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>Upload Doctor <br /> Picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

          {/* Left Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>

            <div>
              <p>Doctor Name</p>
              <input
                type="text"
                placeholder='Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-1'
              />
            </div>

            <div>
              <p>Email</p>
              <input
                type="email"
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-1'
              />
            </div>

            <div>
              <p>Password</p>
              <input
                type="password"
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-1'
              />
            </div>

            <div>
              <p>Experience</p>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className='w-full border rounded px-3 py-2 mt-1'
              >
                <option value="1 year">1 year</option>
                <option value="2 years">2 years</option>
                <option value="3 years">3 years</option>
                <option value="4 years">4 years</option>
                <option value="5 years">5 years</option>
                <option value="6 years">6 years</option>
                <option value="7 years">7 years</option>
                <option value="8 years">8 years</option>
                <option value="9 years">9 years</option>
                <option value="10 years">10 years</option>
              </select>
            </div>

            <div>
              <p>Fees</p>
              <input
                type="number"
                placeholder='Fees'
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-1'
              />
            </div>

          </div>

          {/* Right Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>

            <div>
              <p>Speciality</p>
              <select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className='w-full border rounded px-3 py-2 mt-1'
              >
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div>
              <p>Education</p>
              <input
                type="text"
                placeholder='Education'
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-1'
              />
            </div>

            <div>
              <p>Address</p>
              <input
                type="text"
                placeholder='Address line 1'
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-1'
              />
              <input
                type="text"
                placeholder='Address line 2'
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                required
                className='w-full border rounded px-3 py-2 mt-2'
              />
            </div>

          </div>
        </div>

        <div className='mt-6'>
          <p>About Doctor</p>
          <textarea
            rows={5}
            placeholder='Write about doctor'
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            required
            className='w-full border rounded px-3 py-2 mt-1'
          />
        </div>

        <button
          type="submit"
          className='mt-6 bg-primary text-white px-6 py-2 rounded hover:opacity-90'
        >
          Add Doctor
        </button>

      </div>
    </form>
  )
}

export default AddDoctor