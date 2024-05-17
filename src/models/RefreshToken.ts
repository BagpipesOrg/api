import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  deviceInfo: {
    type: String,
    required: false,
  },
})

export default mongoose.model('RefreshToken', refreshTokenSchema)
