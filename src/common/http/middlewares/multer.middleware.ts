import multer, { StorageEngine } from 'multer';
import { extname } from 'path';
import { generateToken } from '@/helpers/shared.helper';
import { getAssetPath } from '@/helpers/multer.helper';
import { FolderAssetType } from '@/typings/asset.typing';

// songs -> artist -> albums -> mp3 files

interface Options {
  fileFilter?: multer.Options['fileFilter'];
  limits?: multer.Options['limits'];
}

export function multerMiddleware(
  storage: StorageEngine,
  { fileFilter, limits }: Options,
) {
  // const destination = getAssetPath(asset);
  // const storage = storageFunct(destination);

  return multer({ storage, fileFilter, limits });
}
