import multer from 'multer';
import { unlink } from 'fs-extra';
import { join } from 'path';
import { HttpException } from '@/common/http/exceptions/http.exception';
import { HttpStatus } from '@/common/enums';
import { FolderAssetsType } from '@/typings/shared.typing';

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

export const multerSoundFilter: multer.Options['fileFilter'] = (
  req,
  file,
  cb,
) => {
  const validExtensions = ['audio/mpeg'];
  console.log(file);

  if (validExtensions.some(ext => file.mimetype === ext)) {
    return cb(null, true);
  }

  cb(
    new HttpException(
      HttpStatus.BAD_REQUEST,
      'only .mp3 format sounds are allowed',
    ),
  );
};

export async function removeImage(filename: FolderAssetsType, folder: string) {
  const fullpath = join(__dirname, '..', 'assets', 'uploads', folder, filename);
  console.log(fullpath);
  await unlink(fullpath);
}
