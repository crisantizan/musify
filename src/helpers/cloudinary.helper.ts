import { join } from 'path';
import { ArtistFolder } from '@/common/enums';

export enum CloudFolder {
  BASE = 'cisum',
  /** upload users images */
  USERS = 'cisum/users',
  /** artists folder */
  ARTISTS = 'cisum/artists',
}

export class CloudHelper {
  /** generate artist folder direction */
  public static genArtistsFolder(artistId: string) {
    return join(CloudFolder.ARTISTS, artistId);
  }

  /** generate album folder direction */
  public static genAlbumFolder(artistId: string, albumId: string) {
    return join(CloudFolder.ARTISTS, artistId, ArtistFolder.ALBUMS, albumId);
  }

  /** generate song folder direction */
  public static genSongFolder(
    artistId: string,
    albumId: string,
    songId: string,
  ) {
    return join(
      CloudFolder.ARTISTS,
      artistId,
      ArtistFolder.ALBUMS,
      albumId,
      ArtistFolder.SONGS,
      songId,
    );
  }
}
