import multer from 'multer';
import { serviceResponse } from './service-response.helper';

export const multerImageFilter: multer.Options['fileFilter'] = (
  req,
  file,
  cb,
) => {
  const validExtensions = ['image/png', 'image/jpg', 'image/jpeg'];

  if (validExtensions.some(ext => file.mimetype === ext)) {
    return cb(null, true);
  }

  // only .png .jpg .jpeg format images are allowed
  cb(new Error('only .png .jpg .jpeg format images are allowed'));
};
