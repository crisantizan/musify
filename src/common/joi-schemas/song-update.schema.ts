import joi from '@hapi/joi';
import { SongCreate } from '@/modules/song/song.type';

/** joi song update schema */
export const songUpdateSchema = joi.object<SongCreate>({
  name: joi.string().optional(),
  duration: joi
    .string()
    .optional()
    .pattern(/^[0-9]+:[0-59]+/),
  file: joi.string().optional(),
});
