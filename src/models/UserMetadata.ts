import mongoose from 'mongoose'

const UserMetadata = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  scenarios: [
    {
      scenario: String,
      name: String,
      version: Number,
      executions: [
        {
          execution: String,
          timestamp: Date,
          status: String,
        },
      ],
    },
  ],
  metadata_version: {
    type: Number,
    default: 0,
  },
})

export default mongoose.model('UserMetadata', UserMetadata)
