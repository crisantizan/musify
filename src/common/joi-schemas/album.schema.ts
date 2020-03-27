import joi from '@hapi/joi';
import { AlbumCreate } from '@/modules/album/album.type';

/** joi album schema */
export const albumSchema = joi.object<AlbumCreate>({
  title: joi.string().required(),
  description: joi.string().required(),
  year: joi.number().required(),
  artist: joi.string().required(),
});
