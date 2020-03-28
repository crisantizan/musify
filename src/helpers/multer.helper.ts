import multer from 'multer';
import { remove, mkdirp, pathExists } from 'fs-extra';
import { join, extname } from 'path';
import { HttpException } from '@/common/http/exceptions/http.exception';
import { HttpStatus } from '@/common/enums';
import { FolderAssetType } from '@/typings/asset.typing';
import { serviceResponse } from './service.helper';
import { generateToken } from './shared.helper';

export function imageMulterStorage(asset: FolderAssetType) {
  const destination = getAssetPath(asset);

  return multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      const token = generateToken(10, true);
      const extension = extname(file.originalname);

      cb(null, `${token}${extension}`);
    },
  });
}

export function songMulterStorage() {
  const destination = getAssetPath('SONGS');

  return multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      console.log({ file });
      console.log({ body: req.body });
      // const extension = extname(file.originalname);

      cb(null, file.filename);
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
    throw { name: 'REMOVE_ASSET', error };
  }
}

/** get asset folder path */
// export function getAssetPath2(
//   { assetType, foldeImage }: GetAssetParams,
//   ...paths: string[]
// ) {
//   const assetsPath = join(__dirname, '..', 'assets', 'uploads', assetType);

//   return assetType === 'images'
//     ? // images
//       join(assetsPath, foldeImage!, ...paths)
//     : // songs
//       join(assetsPath, ...paths);
// }

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

/** get asset folder path */
// export function getAssetPath1(
//   assetType: AssetsType,
//   folder: FolderAssetType,
//   ...paths: string[]
// ) {
//   const assetsPath = join(__dirname, '..', 'assets', 'uploads', assetType);

//   if (assetType === 'images') {
//     // images/artists - images/users
//     return join(assetsPath, folder, ...paths);
//   }

//   // folder of song type
//   switch (folder) {
//     // case 'albums':
//     //   return join(assetsPath, 'artists', ...paths);

//     // case 'songs':
//     //   return join(assetsPath, 'artists', 'albums', ...paths);

//     default:
//       // artists
//       return join(assetsPath, ...paths);
//   }
// }

export async function createAssetFolder(path: string, folderName: string) {
  try {
    const fullPath = join(path, folderName);
    await mkdirp(fullPath);
    return fullPath;
  } catch (error) {
    throw serviceResponse(HttpStatus.INTERNAL_SERVER_ERROR, error);
  }
}
