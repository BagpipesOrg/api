import { v4 as uuidv4 } from 'uuid';
import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  isEmailVerified: boolean;
  userId: string;
  refreshToken: string | null;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: () => `user-${uuidv4()}`,
    unique: true,
  },
  refreshToken: {
    type: String,
    default: null,
    required: false,
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
