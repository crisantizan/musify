import { join } from 'path';
import { ArtistFolder } from '@/common/enums';
import { EnvService } from '@/services/env.service';

const { inDevelopment } = new EnvService();

const CLOUD_HOME_FOLDER = inDevelopment ? 'cisum-test' : 'cisum';
const CLOUD_USERS_FOLDER = 'users';
const CLOUD_ARTISTS_FOLDER = 'artists';

/** main folders in cloudinary */
export const CloudFolder = {
  HOME: CLOUD_HOME_FOLDER,
  USERS: join(CLOUD_HOME_FOLDER, CLOUD_USERS_FOLDER),
  ARTISTS: join(CLOUD_HOME_FOLDER, CLOUD_ARTISTS_FOLDER),
};

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
