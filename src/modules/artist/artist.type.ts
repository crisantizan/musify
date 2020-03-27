import { TimestampsFields } from '@/typings/shared.typing';
import { AlbumDocument } from '@/models';

/** necesary data to create an artist */
export interface ArtistCreate {
  name: string;
  description: string;
  coverImage?: string;
}

/** full data of artist */
export interface Artist extends ArtistCreate, TimestampsFields {
  albums: AlbumDocument[];
}
