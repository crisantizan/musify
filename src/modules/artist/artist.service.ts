import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel, AlbumModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import {
  getAssetPath,
  createAssetFolder,
  removeAsset,
} from '@/helpers/multer.helper';
import { getMongooseSession } from '@/db/session';
import { isEquals, mergeObject } from '@/helpers/service.helper';
import { PaginationArtistOptions } from '@/typings/shared.typing';

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
    const [artist, albums] = await Promise.all([
      ArtistModel.findById(artistId).lean(),
      AlbumModel.find({ artist: artistId }).lean(),
    ]);

    if (!artist) {
      throw this.response(HttpStatus.NOT_FOUND, 'artist not found');
    }

    return this.response(HttpStatus.OK, { ...artist, albums });
  }

  /** create new artist */
  public async create(data: ArtistCreate, file: Express.Multer.File) {
    if (!!file) {
      data.coverImage = file.filename;
    }

    const session = await getMongooseSession();
    session.startTransaction();

    try {
      const artist = new ArtistModel(data);
      const newArtist = await artist.save();

      const newFolderPath = getAssetPath('songs', 'artists');
      // create folder to save his albums, the name is his id
      await createAssetFolder(newFolderPath, newArtist.id);
      await session.commitTransaction();

      return this.response(HttpStatus.CREATED, newArtist);
    } catch (error) {
      await session.abortTransaction();

      if (!!file) {
        // remove image upladed
        await removeAsset(file.path);
      }

      throw error;
    } finally {
      session.endSession();
    }
  }

  /** update artist data */
  public async update(
    artistId: string,
    data: Partial<ArtistCreate>,
    file?: Express.Multer.File,
  ) {
    const session = await getMongooseSession();
    session.startTransaction();

    try {
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

      let oldImage = artist.coverImage;

      // add new image
      if (!!file) {
        // assign new image
        data.coverImage = file.filename;
      }

      // update
      await artist.update(data).session(session);
      await session.commitTransaction();

      // delete old image of disk if other has been established
      if (!!oldImage && !!file) {
        const path = getAssetPath('images', 'artists');
        await removeAsset(path, oldImage);
      }

      return this.response(HttpStatus.OK, mergeObject(data, artist));
    } catch (error) {
      await session.abortTransaction();

      if (!!file) {
        // remove image upladed
        await removeAsset(file.path);
      }

      throw error;
    } finally {
      session.endSession();
    }
  }
}
