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

export interface SongUpdate {
  name?: string;
  duration?: string;
  file?: string;
  album?: string;
  // only augmentation in code
  coverImage?: string;
}

/** full data of an song */
export interface Song extends TimestampsFields {
  name: string;
  duration: number;
  coverImage: string;
  file: string;
  album: string | AlbumDocument;
}
