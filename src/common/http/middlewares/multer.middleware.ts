import multer from 'multer';
import { extname } from 'path';
import { generateToken } from '@/helpers/shared.helper';
import { getAssetPath } from '@/helpers/multer.helper';
import { AssetsType, FolderAssetType } from '@/typings/asset.typing';

// songs -> artist -> albums -> mp3 files

interface Options {
  fileFilter?: multer.Options['fileFilter'];
  limits?: multer.Options['limits'];
}

export function multerMiddleware(
  assetType: AssetsType,
  folder: FolderAssetType,
  { fileFilter, limits }: Options,
) {
  const destination = getAssetPath(assetType, folder);

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
