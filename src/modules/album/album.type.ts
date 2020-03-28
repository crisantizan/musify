import { TimestampsFields } from '@/typings/shared.typing';
import { ArtistDocument, SongDocument } from '@/models';

/** necesary data to create a one album */
export interface AlbumCreate {
  title: string;
  description: string;
  year: number;
  coverImage: string | null;
  artist: ArtistDocument | string;
}

/** full data of album */
export interface Album extends AlbumCreate, TimestampsFields {
  songs?: SongDocument[];
}
