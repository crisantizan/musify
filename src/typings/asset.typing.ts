// export type FolderSongType = 'artists' | 'albums' | 'songs';
// export type FolderImageType = 'users' | 'artists';

// export type FolderAssetType = FolderImageType;
// export type AssetsType = 'images' | 'songs';

/** params of the helper getAssetPath */
// export interface GetAssetParams {
//   assetType: AssetsType;
//   foldeImage?: FolderImageType;
// }
export type FolderAssetType =
  | 'IMAGES_USERS'
  | 'IMAGES_ARTISTS'
  | 'IMAGES_ALBUMS'
  | 'SONGS'
  | 'TEMP';
/** type of assets */
