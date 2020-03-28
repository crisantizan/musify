import { multerMiddleware } from './multer.middleware';
import { songMulterStorage } from '@/helpers/multer.helper';
import { megabytesToBytes } from '@/helpers/shared.helper';

/** upload user image through «audio» field */
export const uploadUserImageMiddleware = multerMiddleware(songMulterStorage(), {
  // fileFilter: multerImageFilter,
  limits: { fileSize: megabytesToBytes(10) },
}).single('audio');
