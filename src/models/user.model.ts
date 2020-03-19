import mongoose, { model } from 'mongoose';
import { User } from '@/endpoints/users/users.type';
const { Schema } = mongoose;

export interface UserDocument extends User, mongoose.Document {}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true, dropDups: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: false },
  },
  { timestamps: true },
);

export default model<UserDocument>('User', UserSchema);
