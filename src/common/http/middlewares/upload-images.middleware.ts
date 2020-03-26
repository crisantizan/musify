import { multerMiddleware } from './multer.middleware';
import { multerImageFilter } from '@/helpers/multer.helper';
import { kilobytesTobytes } from '@/helpers/shared.helper';

/** upload user image through «image» field */
export const uploadUserImageMiddleware = multerMiddleware('images', 'users', {
  fileFilter: multerImageFilter,
  limits: { fileSize: kilobytesTobytes(350) },
}).single('image');

/** upload artist image through «image» field */
export const uploadArtistImageMiddleware = multerMiddleware(
  'images',
  'artists',
  {
    fileFilter: multerImageFilter,
    limits: { fileSize: kilobytesTobytes(350) },
  },
).single('image');
