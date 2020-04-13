import { multerMiddleware } from './multer.middleware';
import { multerImageFilter, imageMulterStorage } from '@/helpers/multer.helper';
import { kilobytesTobytes } from '@/helpers/shared.helper';

/** upload temp image through «image» field */
export const uploadTempImageMiddleware = multerMiddleware(
  imageMulterStorage(),
  {
    fileFilter: multerImageFilter,
    limits: { fileSize: kilobytesTobytes(350) },
  },
).single('image');
