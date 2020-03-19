import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

export interface User extends mongoose.Document {
  name: string;
  surname: string;
  email: string;
  role: string;
  image: string;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: false },
  },
  { timestamps: true },
);

export default model<User>('User', UserSchema);
