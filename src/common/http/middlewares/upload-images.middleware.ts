import { multerMiddleware } from './multer.middleware';
import { multerImageFilter, imageMulterStorage } from '@/helpers/multer.helper';
import { kilobytesTobytes } from '@/helpers/shared.helper';

/** upload user image through «image» field */
export const uploadUserImageMiddleware = multerMiddleware(
  imageMulterStorage(true),
  {
    fileFilter: multerImageFilter,
    limits: { fileSize: kilobytesTobytes(350) },
  },
).single('image');

/** upload artist image through «image» field */
export const uploadArtistImageMiddleware = multerMiddleware(
  imageMulterStorage(),
  {
    fileFilter: multerImageFilter,
    limits: { fileSize: kilobytesTobytes(350) },
  },
).single('image');

/** upload album image through «image» field */
export const uploadAlbumImageMiddleware = multerMiddleware(
  imageMulterStorage(),
  {
    fileFilter: multerImageFilter,
    limits: { fileSize: kilobytesTobytes(350) },
  },
).single('image');

/** upload temp image through «image» field */
export const uploadTempImageMiddleware = multerMiddleware(
  imageMulterStorage(),
  {
    fileFilter: multerImageFilter,
    limits: { fileSize: kilobytesTobytes(350) },
  },
).single('image');
