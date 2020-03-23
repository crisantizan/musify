import multer from 'multer';
import { HttpException } from '@/common/http/exceptions/http.exception';
import { HttpStatus } from '@/common/enums';

export const multerImageFilter: multer.Options['fileFilter'] = (
  req,
  file,
  cb,
) => {
  const validExtensions = ['image/png', 'image/jpg', 'image/jpeg'];

  if (validExtensions.some(ext => file.mimetype === ext)) {
    return cb(null, true);
  }

  cb(
    new HttpException(
      HttpStatus.BAD_REQUEST,
      'only .png .jpg .jpeg format images are allowed',
    ),
  );
};
