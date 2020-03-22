import multer from 'multer';
import { join, extname } from 'path';

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
      const extension = extname(file.originalname);
      cb(null, file.originalname);
    },
  });

  return multer({ storage });
}
