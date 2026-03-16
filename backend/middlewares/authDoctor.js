import jwt from 'jsonwebtoken'

const authDoctor = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
      })
    }

    const dToken = authHeader.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(dToken, process.env.JWT_SECRET)

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid, login again'
      })
    }

    // Attach user info to request
    req.doc = { id: decoded.id }  // ✅ now any user can access

    next()
  } catch (error) {
    console.error(error)
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired, login again'
    })
  }
}

export default authDoctor