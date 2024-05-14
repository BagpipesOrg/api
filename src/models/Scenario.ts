import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const Scenario = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    diagramData: {
      type: Object,
      required: true,
    },
    nodes: [{
      nodeData: {
        type: Object,
        required: true
      },
      formData: {
        type: Object,
        default: {}
      }
    }],
    version: {
      type: Number,
      default: 0,
    }

  });

  export default mongoose.model('Scenario', Scenario);
  