import { pathExists } from 'fs-extra';
import { join } from 'path';
import { Service } from '@/services';
import { SongCreate } from './song.type';
import { AlbumModel, ArtistDocument, SongModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import { mongo } from 'mongoose';
import { MulterFile } from '@/typings/shared.typing';
import {
  genSongUploadPath,
  getAssetPath,
  transformPath,
  removeAsset,
} from '@/helpers/multer.helper';
import { move } from 'fs-extra';

export class SongService extends Service {
  constructor() {
    super();
  }

  /** create a new song */
  public async create(data: SongCreate, imageFile: MulterFile) {
    const album = await AlbumModel.findById(data.album).populate({
      path: 'artist',
      select: '_id',
    });

    // verify if album exists
    if (!album) {
      throw this.response(HttpStatus.NOT_FOUND, "album doesn't exists");
    }

    const pathTempAudio = getAssetPath('TEMP_SONGS', data.file);

    // verify audio file
    if (!(await pathExists(pathTempAudio))) {
      throw this.response(HttpStatus.BAD_REQUEST, 'audio file is required');
    }

    const songId = new mongo.ObjectId();

    let [pathToDB, coverImageFullPath] = ['', ''];

    // asset path for this song
    pathToDB = genSongUploadPath(
      String((album.artist as ArtistDocument)._id),
      String(album._id),
      String(songId),
    );

    if (!!imageFile) {
      // full path of the cover image
      coverImageFullPath = getAssetPath(
        'ARTISTS',
        pathToDB,
        imageFile.filename,
      );

      // asign cover image
      data.coverImage = transformPath(
        join(pathToDB, imageFile.filename),
        'encode',
      );
    }

    // move audio file
    const soundFullPath = getAssetPath('ARTISTS', pathToDB, data.file);
    const soundFileName = data.file;

    data.file = transformPath(join(pathToDB, soundFileName), 'encode');

    try {
      if (!!coverImageFullPath) {
        // move from temp files to final folder
        await move(imageFile.path, coverImageFullPath);
      }
      await move(getAssetPath('TEMP_SONGS', soundFileName), soundFullPath);

      const song = await new SongModel({ _id: songId, ...data }).save();

      return this.response(HttpStatus.CREATED, song);
    } catch (error) {
      // error saving new song in mongo
      if (error.code !== 'ENOENT' && !!coverImageFullPath) {
        await removeAsset(coverImageFullPath);
      }

      await removeAsset(coverImageFullPath);

      throw error;
    }
  }
}
