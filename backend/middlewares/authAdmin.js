import jwt from 'jsonwebtoken'

const authAdmin = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, login again'
      })
    }

    const token = authHeader.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if role is admin
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden, admin only'
      })
    }

    // Attach admin info to request
    req.admin = decoded

    // Continue to controller
    next()

  } catch (error) {
    console.log(error)
    return res.status(401).json({
      success: false,
      message: 'Token invalid, login again'
    })
  }
}

export default authAdmin