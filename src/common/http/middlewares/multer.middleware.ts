import multer from 'multer';
import { join, extname } from 'path';
import { generateToken } from '@/helpers/shared.helper';

type FolderType = 'avatars' | 'covers' | 'songs';

interface Options {
  fileFilter?: multer.Options['fileFilter'];
  limits?: multer.Options['limits'];
}

export function multerMiddleware(
  folder: FolderType,
  { fileFilter, limits }: Options,
) {
  const destination = join(
    __dirname,
    '..',
    '..',
    '..',
    'assets',
    'uploads',
    folder,
  );

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
