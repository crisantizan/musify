import joi from '@hapi/joi';
import { PaginationArtistOptions } from '@/typings/shared.typing';

/** joi artist pagination schema */
export const artistPaginationSchema = joi.object<PaginationArtistOptions>({
  limit: joi.number().optional(),
  page: joi.number().optional(),
  byName: joi.string().optional(),
});
