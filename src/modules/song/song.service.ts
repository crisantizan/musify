import { pathExists } from 'fs-extra';
import { join } from 'path';
import { Service } from '@/services';
import { SongCreate, SongUpdate } from './song.type';
import { AlbumModel, ArtistDocument, SongModel, AlbumDocument } from '@/models';
import { HttpStatus } from '@/common/enums';
import { mongo } from 'mongoose';
import { MulterFile, PaginationSongOptions } from '@/typings/shared.typing';
import { getAssetPath, removeAsset } from '@/helpers/multer.helper';
import {
  isEquals,
  mergeObject,
  objectIsEmpty,
  removeUndefinedProps,
} from '@/helpers/service.helper';
import { cloudService } from '@/services/cloudinary.service';
import { CloudHelper } from '@/helpers/cloudinary.helper';

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
      select: '_id name album coverImage',
      populate: {
        path: 'album',
        select: 'artist coverImage',
        lean: true,
        populate: { path: 'artist', select: '_id name', lean: true },
      },
      sort: !!name ? 'name' : 'createdAt',
    });

    return this.response(HttpStatus.OK, songs);
  }

  /** update a song */
  public async update(
    songId: string,
    data: SongUpdate,
    imageFile?: MulterFile,
  ) {
    try {
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

      // song folder in cloudinary
      const folder = CloudHelper.genSongFolder(
        String(((song.album as AlbumDocument).artist as ArtistDocument)._id),
        String((song.album as AlbumDocument)._id),
        songId,
      );

      // if the new song has been sent
      if (!!data.file) {
        const audioPath: string = getAssetPath('TEMP_SONGS', <string>data.file);

        // verify audio file existence
        if (!(await pathExists(audioPath))) {
          console.error(new Error(`Path: ${audioPath} doesn't exists`));

          throw this.response(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Internal server error',
          );
        }

        // upload to cloudinary
        const audioResult = await cloudService.uploader.upload(audioPath, {
          folder,
          resource_type: 'video',
        });

        data.file = {
          id: audioResult.public_id,
          path: audioResult.secure_url,
        };

        // remove from local
        await removeAsset(audioPath);

        // remove old audio file if it's exists
        !!song.file.id &&
          (await cloudService.uploader.destroy(song.file.id, {
            resource_type: 'video',
          } as any));
      }

      // if a new image has been sent
      if (!!imageFile) {
        const imageResult = await cloudService.uploader.upload(imageFile.path, {
          folder,
        });

        data.coverImage = {
          id: imageResult.public_id,
          path: cloudService.url(imageResult.public_id, {
            height: 250,
            width: 250,
            crop: 'fill',
            secure: true,
          }),
        };

        // remove from local
        await removeAsset(imageFile.path);

        // remove old image file
        !!song.coverImage.id &&
          (await cloudService.uploader.destroy(song.coverImage.id));
      }

      await song.updateOne(data);

      return this.response(HttpStatus.OK, mergeObject(data, song));
    } catch (error) {
      throw error;
    }
  }

  /** create a new song */
  public async create(data: SongCreate, imageFile: MulterFile) {
    try {
      const album = await AlbumModel.findById(data.album).populate({
        path: 'artist',
        select: '_id',
      });

      // verify if album exists
      if (!album) {
        throw this.response(HttpStatus.NOT_FOUND, "album doesn't exists");
      }

      const audioPath = getAssetPath('TEMP_SONGS', <string>data.file);

      // verify audio file
      if (!(await pathExists(audioPath))) {
        throw this.response(HttpStatus.BAD_REQUEST, 'audio file is required');
      }

      const songId = new mongo.ObjectId().toHexString();

      // the new folder for this song in cloudinary
      const folder = CloudHelper.genSongFolder(
        String((album.artist as ArtistDocument)._id),
        String(album._id),
        songId,
      );

      if (!!imageFile) {
        // uplad to cloudinary
        const result = await cloudService.uploader.upload(imageFile.path, {
          folder,
        });

        data.coverImage = {
          id: result.public_id,
          // send croped image
          path: cloudService.url(result.public_id, {
            height: 250,
            width: 250,
            crop: 'fill',
            secure: true,
          }),
        };

        // remove local image
        await removeAsset(imageFile.path);
      } else {
        data.coverImage = {
          id: null,
          path: null,
        };
      }

      // uplad to cloudinary
      const audioResult = await cloudService.uploader.upload(audioPath, {
        folder,
        resource_type: 'video',
      });

      // asign data of cloudinary
      data.file = {
        id: audioResult.public_id,
        path: audioResult.secure_url,
      };

      // remove local audio
      await removeAsset(audioPath);

      const song = await new SongModel({ _id: songId, ...data }).save();

      return this.response(HttpStatus.CREATED, song);
    } catch (error) {
      throw error;
    }
  }

  /** remove a song */
  public async remove(songId: string) {
    try {
      const song = await SongModel.findByIdAndRemove(songId);

      if (!song) {
        throw this.response(HttpStatus.NOT_FOUND, "song doesn't exists");
      }

      const [, , artistsId, , albumId] = song.file.id!.split('/');
      const folder = CloudHelper.genSongFolder(artistsId, albumId, songId);

      // remove all files of this song
      await Promise.all([
        // audio
        cloudService.api.delete_resources_by_prefix(folder, {
          resource_type: 'video',
        }),
        // images
        cloudService.api.delete_resources_by_prefix(folder),
      ]);

      // remove empty folder
      await (cloudService.api as any).delete_folder(folder);

      return this.response(HttpStatus.OK, 'song removed successfully!');
    } catch (error) {
      throw error;
    }
  }
}
