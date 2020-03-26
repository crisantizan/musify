import mongoose, { model, Document } from 'mongoose';
import { User, UserCreate } from '@/modules/user/user.type';
import { EncryptService } from '@/services/encrypt.service';
const { Schema } = mongoose;

export interface UserDocument extends User, Document {}

const UserSchema = new Schema<UserCreate>(
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

UserSchema.set('toJSON', { virtuals: true });

// try encrypt password
UserSchema.pre('save', async function(next) {
  try {
    const user = this as UserDocument;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      return next();
    }

    user.password = await EncryptService.createHash(user.password);
    next();
  } catch (error) {
    next(error);
  }
});

export const UserModel = model<UserDocument>('User', UserSchema);
