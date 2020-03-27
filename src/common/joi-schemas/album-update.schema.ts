import joi from '@hapi/joi';
import { AlbumCreate } from '@/modules/album/album.type';

/** joi album update schema */
export const albumUpdateSchema = joi.object<AlbumCreate>({
  title: joi.string().optional(),
  description: joi.string().optional(),
  year: joi.number().optional(),
  artist: joi.string().optional(),
});
