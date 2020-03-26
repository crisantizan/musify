import multer from 'multer';
import { join, extname } from 'path';
import { generateToken } from '@/helpers/shared.helper';
import { FolderAssetsType } from '@/typings/shared.typing';
import { getAssetPath } from '@/helpers/multer.helper';
import { AssetsType, FolderAssetType } from '@/typings/asset.typing';

// songs -> artist -> albums -> mp3 files

interface Options {
  fileFilter?: multer.Options['fileFilter'];
  limits?: multer.Options['limits'];
}

export function multerMiddleware(
  // folder: FolderAssetsType,
  assetType: AssetsType,
  folder: FolderAssetType,
  { fileFilter, limits }: Options,
) {
  const destination = getAssetPath(assetType, folder)

  const storage = multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      const token = generateToken(10, true);
      const extension = extname(file.originalname);

      cb(null, `${token}${extension}`);
    },
  });

  return multer({ storage, fileFilter, limits });
}
