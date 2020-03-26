import joi from '@hapi/joi';
import { ArtistCreate } from '@/modules/artist/artist.type';

/** joi artist schema */
export const artistSchema = joi.object<ArtistCreate>({
  name: joi.string().required(),
  description: joi.string().required(),
});
