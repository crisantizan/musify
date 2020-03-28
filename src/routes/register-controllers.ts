/**
 * import here all controllers
 */
import { UserController } from '@/modules/user/user.controller';
import { ArtistController } from '@/modules/artist/artist.controller';
import { AlbumController } from '@/modules/album/album.controller';
import { SongController } from '@/modules/song/song.controller';

export default [
  UserController,
  ArtistController,
  AlbumController,
  SongController,
];
