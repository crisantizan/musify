import { TimestampsFields } from '@/typings/shared.typing';
import { AlbumDocument } from '@/models';

/** necesary data to create an artist */
export interface SongCreate {
  name: string;
  duration: number;
  file: string;
  /** album id to assign */
  album: string;
  coverImage?: string;
}

/** full data of an song */
export interface Song extends TimestampsFields {
  name: string;
  duration: number;
  file: string;
  album: string | AlbumDocument;
}
