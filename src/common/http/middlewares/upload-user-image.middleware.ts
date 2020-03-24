import { multerMiddleware } from './multer.middleware';
import { multerImageFilter } from '@/helpers/multer.helper';
import { kilobytesTobytes } from '@/helpers/shared.helper';

export const uploadUserImageMiddleware = multerMiddleware('avatars', {
  fileFilter: multerImageFilter,
  limits: { fileSize: kilobytesTobytes(350) },
}).single('avatar');
