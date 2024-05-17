// verifyToken.js
import jwt from 'jsonwebtoken'

export default function verifyToken(req, res, next) {
  console.log('Entered verifyToken middleware')

  const token = req.cookies.accessToken
  console.log('Token from cookie:', token)

  if (!token) {
    console.log('No token found')
    return res.status(401).send('Access Denied')
  }

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    console.log('Token verified:', verified)
    req.user = verified
    console.log('Attached user:', req.user)
    next() // Move on to the next middleware
  } catch (err) {
    console.log('Token verification failed:', err)
    return res.status(400).json({ error: 'Invalid Token' })
  }
}
