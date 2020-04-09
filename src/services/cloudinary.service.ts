import { v2 as cloudinary } from 'cloudinary';
import { EnvService } from './env.service';

const { cloudinaryConfig } = new EnvService();

cloudinary.config(cloudinaryConfig);

export const cloudService = cloudinary;
