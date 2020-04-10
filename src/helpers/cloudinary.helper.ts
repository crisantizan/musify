import { join } from 'path';

export enum CloudFolder {
  BASE = 'cisum',
  /** upload users images */
  USERS = 'cisum/users',
  /** artists folder */
  ARTISTS = 'cisum/artists',
}

/** users upload image path */
export function getCloudFolder(path: string) {
  return join(CloudFolder.USERS, path);
}

export function genCloudUsersPath(publicId: string) {
  return join(CloudFolder.USERS, publicId);
}

export class CloudHelper {
  /** generate artist folder direction */
  public static genArtistsFolder(artistId: string) {
    return join(CloudFolder.ARTISTS, artistId);
  }
}

type CloudFolderBase = 'users' | 'artists';

export function genCloudPath(type: CloudFolderBase) {
  switch (type) {
    case 'users':
      break;

    default:
      break;
  }
}

// function genCloudFolderByType(type: CloudFolderType) {
//   switch (type) {
//     case 'users':
//       return CloudFolder.USERS;
//     case 'artists':
//       return CloudFolder.ARTISTS;
//   }
// }
