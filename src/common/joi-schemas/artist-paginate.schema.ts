import joi from '@hapi/joi';
import { PaginationOptions } from '@/typings/shared.typing';

/** joi artist pagination schema */
export const artistPaginationSchema = joi.object<PaginationOptions>({
  limit: joi.number().optional(),
  page: joi.number().optional(),
});
