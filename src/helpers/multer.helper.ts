import multer from 'multer';
import { remove, mkdirp, pathExists } from 'fs-extra';
import { join } from 'path';
import { HttpException } from '@/common/http/exceptions/http.exception';
import { HttpStatus } from '@/common/enums';
import {
  AssetsType,
  FolderAssetType,
  FolderSongType,
} from '@/typings/asset.typing';

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

/** remove asset: file or directory */
export async function removeAsset(basePath: string, ...paths: string[]) {
  try {
    let fullPath = !paths.length ? basePath : join(basePath, ...paths);

    // remove only if it exists
    if (await pathExists(fullPath)) {
      await remove(fullPath);
    }
  } catch (error) {
    throw error;
  }
}

/** get asset folder path */
export function getAssetPath(assetType: AssetsType, folder: FolderAssetType) {
  const assetsPath = join(__dirname, '..', 'assets', 'uploads', assetType);

  if (assetType === 'images') {
    // images/artists - images/users
    return join(assetsPath, folder);
  }

  // folder of song type
  switch (folder as FolderSongType) {
    case 'albums':
      return join(assetsPath, 'artists');

    case 'songs':
      return join(assetsPath, 'artists', 'albums');

    default:
      // artists
      return assetsPath;
  }
}

export async function createAssetFolder(path: string, folderName: string) {
  try {
    await mkdirp(join(path, folderName));
  } catch (error) {
    throw error;
  }
}
