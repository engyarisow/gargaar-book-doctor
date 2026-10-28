import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js'

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, login again' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ⚡ CRITICAL: Check Database for Block Status
    const doctor = await doctorModel.findById(decoded.id).select('blocked')

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' })
    }

    if (doctor.blocked) {
      // Sending 403 tells the frontend: "You are logged in, but you are specifically BANNED"
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is blocked. Access denied immediately.' 
      })
    }

    req.doc = { id: decoded.id }
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({ success: false, message: 'Session expired, login again' })
  }
}

export default authDoctor