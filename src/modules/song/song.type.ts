import { TimestampsFields, Asset } from '@/typings/shared.typing';
import { AlbumDocument } from '@/models';

/** necesary data to create an artist */
export interface SongCreate {
  name: string;
  duration: number;
  file: string | Asset;
  /** album id to assign */
  album: string;
  coverImage?: Asset;
}

export interface SongUpdate {
  name?: string;
  duration?: string;
  file?: string;
  album?: string;
  // only augmentation in code
  coverImage?: Asset;
}

/** full data of an song */
export interface Song extends TimestampsFields {
  name: string;
  duration: number;
  coverImage: Asset;
  file: Asset;
  album: string | AlbumDocument;
}
