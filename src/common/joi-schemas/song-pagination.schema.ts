import joi from '@hapi/joi';
import { PaginationSongOptions } from '@/typings/shared.typing';

/** song search schema */
export const songPaginationSchema = joi.object<PaginationSongOptions>({
  limit: joi.number().optional(),
  page: joi.number().optional(),
  album: joi.string().optional(),
  name: joi.string().optional(),
});
