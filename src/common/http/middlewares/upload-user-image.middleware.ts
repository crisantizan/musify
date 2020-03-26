import { multerMiddleware } from './multer.middleware';
import { multerImageFilter } from '@/helpers/multer.helper';
import { kilobytesTobytes } from '@/helpers/shared.helper';

export const uploadUserImageMiddleware = multerMiddleware('images/users', {
  fileFilter: multerImageFilter,
  limits: { fileSize: kilobytesTobytes(350) },
}).single('avatar');
