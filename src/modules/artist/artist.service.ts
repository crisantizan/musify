import { mongo } from 'mongoose';
import { join } from 'path';
import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel, AlbumModel, SongModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import {
  getAssetPath,
  removeAsset,
  transformPath,
} from '@/helpers/multer.helper';
import { getMongooseSession } from '@/db/session';
import { isEquals, mergeObject, objectIsEmpty } from '@/helpers/service.helper';
import { PaginationArtistOptions } from '@/typings/shared.typing';
import { move } from 'fs-extra';
import { cloudService } from '@/services/cloudinary.service';
import { CloudHelper } from '@/helpers/cloudinary.helper';

export class ArtistService extends Service {
  constructor() {
    super();
  }

  /** get all */
  public async getAll({
    limit = 10,
    page = 1,
    byName,
  }: PaginationArtistOptions) {
    // filter
    const query = !byName ? {} : { name: new RegExp(byName, 'i') };

    const artists = await ArtistModel.paginate(query, {
      page,
      limit,
      select: 'id name description coverImage',
      sort: 'name',
    });

    return this.response(HttpStatus.OK, artists);
  }

  /** get one artist, all basic data of his albums */
  public async getOne(artistId: string) {
    const artist = await ArtistModel.findById(artistId).lean();

    if (!artist) {
      throw this.response(HttpStatus.NOT_FOUND, 'artist not found');
    }

    return this.response(HttpStatus.OK, artist);
  }

  /** create new artist */
  public async create(data: ArtistCreate, file: Express.Multer.File) {
    const artistId = new mongo.ObjectId().toHexString();

    if (!!file) {
      const result = await cloudService.uploader.upload(file.path, {
        folder: CloudHelper.genArtistsFolder(artistId),
      });

      data.coverImage = {
        id: result.public_id,
        // send croped image
        path: cloudService.url(result.public_id, {
          height: 350,
          width: 250,
          crop: 'fill',
          secure: true,
        }),
      };

      // remove local image
      await removeAsset(file.path);
    } else {
      data.coverImage = {
        id: null,
        path: null,
      };
    }

    const artist = new ArtistModel({ _id: artistId, ...data });
    const newArtist = await artist.save();

    return this.response(HttpStatus.CREATED, newArtist);
  }

  /** update artist data */
  public async update(
    artistId: string,
    data: Partial<ArtistCreate>,
    file?: Express.Multer.File,
  ) {
    if (!file && !Object.keys(data).length) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'at least one field must be sent',
      );
    }
    const artist = await ArtistModel.findById(artistId);

    if (!artist) {
      throw this.response(HttpStatus.NOT_FOUND, 'artist not found');
    }

    // if the same data has been sent
    if (!file && isEquals(data, artist)) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'the same data has been sent',
      );
    }

    const oldImageId = !objectIsEmpty(artist.coverImage!)
      ? artist.coverImage!.id
      : null;

    // add new image
    if (!!file) {
      const result = await cloudService.uploader.upload(file.path, {
        folder: CloudHelper.genArtistsFolder(artistId),
      });

      data.coverImage = {
        id: result.public_id,
        // send croped image
        path: cloudService.url(result.public_id, {
          height: 350,
          width: 250,
          crop: 'fill',
          secure: true,
        }),
      };

      // remove local image
      await removeAsset(file.path);
    }

    // update
    await artist.updateOne(data);

    // delete old image if other has been established
    !!oldImageId && (await cloudService.uploader.destroy(oldImageId));

    return this.response(HttpStatus.OK, mergeObject(data, artist));
  }

  /** remove an artist */
  public async remove(artistId: string) {
    const session = await getMongooseSession();
    session.startTransaction();

    try {
      const artist = await ArtistModel.findByIdAndDelete(artistId).session(
        session,
      );

      if (!artist) {
        throw this.response(HttpStatus.NOT_FOUND, "artist doesn't exists");
      }

      const albums = await AlbumModel.find({ artist: artistId })
        .select('_id artist')
        .lean();

      albums.forEach(async album => {
        await AlbumModel.deleteMany({ _id: album._id }).session(session);
        await SongModel.deleteMany({ album: album._id }).session(session);
      });

      const folder = CloudHelper.genArtistsFolder(artistId);

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

      await session.commitTransaction();

      return this.response(HttpStatus.OK, 'artist removed successfully!');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
