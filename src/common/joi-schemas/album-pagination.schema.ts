import joi from '@hapi/joi';
import { PaginationAlbumOptions } from '@/typings/shared.typing';

/** joi artist pagination schema */
export const albumPaginationSchema = joi.object<PaginationAlbumOptions>({
  limit: joi.number().optional(),
  page: joi.number().optional(),
  byArtist: joi.string().optional(),
  title: joi.string().optional(),
  year: joi.number().optional(),
});
