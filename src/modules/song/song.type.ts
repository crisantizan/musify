import { TimestampsFields } from '@/typings/shared.typing';
import { AlbumDocument } from '@/models';

/** necesary data to create an artist */
export interface SongCreate {
  name: string;
  duration: number;
  file: string;
  album: string | AlbumDocument;
}

/** full data of an song */
export interface Song extends SongCreate, TimestampsFields {
  album: AlbumDocument;
}
