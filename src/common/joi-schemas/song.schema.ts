import joi from '@hapi/joi';
import { SongCreate } from '@/modules/song/song.type';

/** joi song schema */
export const songSchema = joi.object<SongCreate>({
  name: joi.string().required(),
  duration: joi.string().required().pattern(/^[0-9]+:[0-59]+/),
  album: joi.string().required(),
  file: joi.string().required(),
});
