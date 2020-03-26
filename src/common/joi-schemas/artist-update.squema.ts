import joi from '@hapi/joi';
import { ArtistCreate } from '@/modules/artist/artist.type';

/** joi artist schema */
export const artistUpdateSchema = joi.object<ArtistCreate>({
  name: joi.string().optional(),
  description: joi.string().optional(),
});
