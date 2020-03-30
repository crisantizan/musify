import multer, { StorageEngine } from 'multer';
interface Options {
  fileFilter?: multer.Options['fileFilter'];
  limits?: multer.Options['limits'];
}

export function multerMiddleware(
  storage: StorageEngine,
  { fileFilter, limits }: Options,
) {
  return multer({ storage, fileFilter, limits });
}
