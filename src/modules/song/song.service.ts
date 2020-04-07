import { pathExists } from 'fs-extra';
import { join } from 'path';
import { Service } from '@/services';
import { SongCreate, SongUpdate } from './song.type';
import { AlbumModel, ArtistDocument, SongModel, AlbumDocument } from '@/models';
import { HttpStatus } from '@/common/enums';
import { mongo } from 'mongoose';
import { MulterFile, PaginationSongOptions } from '@/typings/shared.typing';
import {
  genSongUploadPath,
  getAssetPath,
  transformPath,
  removeAsset,
} from '@/helpers/multer.helper';
import { move } from 'fs-extra';
import {
  isEquals,
  mergeObject,
  objectIsEmpty,
  assetFileName,
  removeUndefinedProps,
} from '@/helpers/service.helper';

export class SongService extends Service {
  constructor() {
    super();
  }

  /** get one: all data */
  public async getOne(songId: string) {
    const song = await SongModel.findById(songId)
      .lean()
      .populate({
        path: 'album',
        populate: { path: 'artist', select: '_id name' },
      });

    if (!song) {
      throw this.response(HttpStatus.NOT_FOUND, "song doesn't exists");
    }

    return this.response(HttpStatus.OK, song);
  }

  /** search song */
  public async searchAndPaginate({
    page = 1,
    limit = 10,
    album,
    name,
  }: PaginationSongOptions) {
    // create filter
    const query =
      !!album || !!name
        ? { album, name: !!name ? new RegExp(name, 'i') : undefined }
        : {};

    removeUndefinedProps(query);

    const songs = await SongModel.paginate(query, {
      page,
      limit,
      lean: true,
      select: '_id name album',
      populate: {
        path: 'album',
        select: 'artist',
        lean: true,
        populate: { path: 'artist', select: '_id name', lean: true },
      },
      sort: !!name ? 'name' : 'createdAt',
    });

    return this.response(HttpStatus.OK, songs);
  }

  /** update an song */
  public async update(
    songId: string,
    data: SongUpdate,
    imageFile?: MulterFile,
  ) {
    const song = await SongModel.findById(songId).populate({
      path: 'album',
      select: '_id title artist',
      lean: true,
      populate: {
        path: 'artist',
        select: '_id name',
        lean: true,
      },
    });

    // verify if song exists
    if (!song) {
      throw this.response(HttpStatus.NOT_FOUND, "song doesn't exists");
    }

    if (!imageFile && !data.file && objectIsEmpty(data)) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'at least one field must be sent',
      );
    }

    // if the same data has been sent
    if (!imageFile && !data.file && isEquals(data, song, 'file', 'album')) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'the same data has been sent',
      );
    }

    let newSongFolder = '';

    const currentSongFolder = genSongUploadPath(
      String(((song.album as AlbumDocument).artist as ArtistDocument)._id),
      String((song.album as AlbumDocument)._id),
      songId,
    );

    // new sound filename
    const newSoundFileName = data.file;

    let soundDestination = '';
    // if an audio file has been sent
    if (!!newSoundFileName) {
      const pathTempAudio = getAssetPath('TEMP_SONGS', newSoundFileName);

      // verify audio file
      if (!(await pathExists(pathTempAudio))) {
        console.error(new Error(`Path: ${pathTempAudio} doesn't exists`));

        throw this.response(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Internal server error',
        );
      }

      soundDestination = getAssetPath(
        'ARTISTS',
        transformPath(song.file, 'decode'),
      );

      data.file = song.file;
    }

    let imageDestination = '';

    // change image if the current song already has an cover image
    if (!!imageFile && !!song.coverImage) {
      imageDestination = getAssetPath(
        'ARTISTS',
        transformPath(song.coverImage, 'decode'),
      );
    }

    // if a new album is send, verify
    if (
      !!data.album &&
      data.album !== String((song.album as AlbumDocument)._id)
    ) {
      if (!(await AlbumModel.exists({ _id: data.album }))) {
        throw this.response(
          HttpStatus.NOT_FOUND,
          "the new album doesn't exists",
        );
      }

      // new folder, move data here
      newSongFolder = genSongUploadPath(
        String(((song.album as AlbumDocument).artist as ArtistDocument)._id),
        data.album,
        songId,
      );

      // if new audio file has been sent
      if (!!newSoundFileName) {
        // rename path: only change the album folder
        const newSoundPath = join(newSongFolder, song.file.split('$')[5]);

        // assign the new address
        data.file = transformPath(newSoundPath, 'encode');

        soundDestination = getAssetPath('ARTISTS', newSoundPath);
      } else {
        // update current audio file path
        song.file = transformPath(
          join(newSongFolder, song.file.split('$')[5]),
          'encode',
        );
      }

      if (!!imageFile) {
        const newImageFolder = join(
          newSongFolder,
          !!song.coverImage
            ? // if the current song already have a image
              song.coverImage.split('$')[5]
            : // assign the new image, before don't had
              imageFile.filename,
        );
        // assign new cover image path
        data.coverImage = transformPath(newImageFolder, 'encode');

        // if the current song already has an cover image
        if (!!song.coverImage) {
          imageDestination = getAssetPath('ARTISTS', newImageFolder);
        }
      } else {
        // update the current image file path, if there's
        if (!!song.coverImage) {
          song.coverImage = transformPath(
            join(newSongFolder, song.coverImage.split('$')[5]),
            'encode',
          );
        }
      }
    }

    try {
      // change song of album directory
      !!newSongFolder &&
        (await move(
          getAssetPath('ARTISTS', currentSongFolder),
          getAssetPath('ARTISTS', newSongFolder),
        ));

      // new image has been sent
      if (!!imageFile) {
        // song already had a image
        !!imageDestination
          ? // replace old image with the new
            await move(imageFile.path, imageDestination, { overwrite: true })
          : // move new image to song folder
            await move(
              imageFile.path,
              getAssetPath(
                'ARTISTS',
                newSongFolder || currentSongFolder,
                imageFile.filename,
              ),
            );
      }

      // new audio has been sent
      !!soundDestination &&
        (await move(
          getAssetPath('TEMP_SONGS', newSoundFileName!),
          soundDestination,
          { overwrite: true },
        ));

      await song.updateOne(data);

      return this.response(HttpStatus.OK, mergeObject(data, song));
    } catch (error) {
      console.log(error);
      !!imageFile && (await removeAsset(imageFile.path));

      throw error;
    }
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
      const imageFileName = assetFileName('image', imageFile.filename);
      // full path of the cover image
      coverImageFullPath = getAssetPath(
        'ARTISTS',
        pathToDB,
        imageFileName,
        // imageFile.filename,
      );

      // asign cover image
      data.coverImage = transformPath(join(pathToDB, imageFileName), 'encode');
    }

    const originalName = data.file;
    const soundFileName = assetFileName('audio', data.file);

    // move audio file
    const soundFullPath = getAssetPath('ARTISTS', pathToDB, soundFileName);

    data.file = transformPath(join(pathToDB, soundFileName), 'encode');

    try {
      if (!!coverImageFullPath) {
        // move from temp files to final folder
        await move(imageFile.path, coverImageFullPath);
      }
      await move(getAssetPath('TEMP_SONGS', originalName), soundFullPath);

      const song = await new SongModel({ _id: songId, ...data }).save();

      return this.response(HttpStatus.CREATED, song);
    } catch (error) {
      // error saving new song in mongo
      if (error.code !== 'ENOENT' && !!coverImageFullPath) {
        await removeAsset(coverImageFullPath);
      }

      await removeAsset(soundFullPath);

      throw error;
    }
  }
}
