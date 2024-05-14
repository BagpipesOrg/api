import mongoose from 'mongoose';

const Execution = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scenario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true
    },
    status: {
      type: String,
      enum: ['Running', 'Completed', 'Failed'],
      default: 'Running'
    },
    executionData: {
      type: Object,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: Object,
      default: {}
    },

});

export default mongoose.model('Execution', Execution);
