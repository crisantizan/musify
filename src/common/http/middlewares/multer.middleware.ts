import multer from 'multer';
import { join, extname } from 'path';
import { generateToken } from '@/helpers/shared.helper';

type FolderType = 'avatars' | 'covers' | 'sounds';

export function multerMiddleware(folder: FolderType) {
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

  return multer({ storage });
}
