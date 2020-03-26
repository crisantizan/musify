import { TimestampsFields } from '@/typings/shared.typing';

/** necesary data to create an artist */
export interface ArtistCreate {
  name: string;
  description: string;
  coverImage?: string;
}

/** full data of artist */
export interface Artist extends ArtistCreate, TimestampsFields {}
