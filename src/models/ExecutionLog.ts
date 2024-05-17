import mongoose from 'mongoose'

const ExecutionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    execution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
    },
    nodeId: String,
    scenario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scenario',
      required: true,
    },
    content: Object,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: String,
    execution_status: {
      type: String,
      enum: ['Running', 'Stopped', 'Completed', 'Failed'], // Uppercase to match Execution schema
      default: 'Running',
    },
  },
  {
    timestamps: true, // From mongodb. Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
  },
)

export default mongoose.model('ExecutionLog', ExecutionLogSchema)
