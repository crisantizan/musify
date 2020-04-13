import multer from 'multer';
import { remove, pathExists } from 'fs-extra';
import { join, extname } from 'path';
import { HttpException } from '@/common/http/exceptions/http.exception';
import { HttpStatus } from '@/common/enums';
import { FolderAssetType } from '@/typings/asset.typing';
import { generateToken } from './shared.helper';

export function imageMulterStorage() {
  const destination = getAssetPath('TEMP_IMAGES');

  return multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      const token = generateToken(10);
      const extension = extname(file.originalname);

      cb(null, `${token}${extension}`);
    },
  });
}

export function songMulterStorage() {
  const destination = getAssetPath('TEMP_SONGS');

  return multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      const extension = extname(file.originalname);

      cb(null, `${Date.now()}${extension}`);
    },
  });
}

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
      'file uploader: only .png .jpg .jpeg format images are allowed',
    ),
  );
};

export const multerAudioFilter: multer.Options['fileFilter'] = (
  req,
  file,
  cb,
) => {
  const validExtensions = ['audio/mpeg'];

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

/** remove asset: file or directory */
export async function removeAsset(basePath: string, ...paths: string[]) {
  try {
    let fullPath = !paths.length ? basePath : join(basePath, ...paths);

    // remove only if it exists
    if (await pathExists(fullPath)) {
      await remove(fullPath);
    }
  } catch (error) {
    throw { name: 'REMOVE_ASSET', error };
  }
}

/** get asset folder path */
export function getAssetPath(asset: FolderAssetType, ...paths: string[]) {
  return join(
    __dirname,
    '..',
    'assets',
    'uploads',
    ...asset.split('_').map(folder => folder.toLowerCase()),
    ...paths,
  );
}
