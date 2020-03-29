import { multerMiddleware } from './multer.middleware';
import { songMulterStorage, multerAudioFilter } from '@/helpers/multer.helper';
import { megabytesToBytes } from '@/helpers/shared.helper';

/** upload song through «audio» field */
export const uploadSongMiddleware = multerMiddleware(songMulterStorage(), {
  fileFilter: multerAudioFilter,
  limits: { fileSize: megabytesToBytes(10) },
}).single('audio');
