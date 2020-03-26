import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import {
  getAssetPath,
  createAssetFolder,
  removeAsset,
} from '@/helpers/multer.helper';
import { getMongooseSession } from '@/db/session';
import { isEquals, mergeObject } from '@/helpers/service.helper';
import { PaginationOptions } from '@/typings/shared.typing';

export class ArtistService extends Service {
  constructor() {
    super();
  }

  /** get all */
  public async getAll({ limit = 10, page = 1, byName }: PaginationOptions) {
    // filter
    const query = !byName ? {} : { name: new RegExp(byName, 'i') };

    const artists = await ArtistModel.paginate(query, {
      page,
      limit,
      select: 'id name description',
    });

    return this.response(HttpStatus.OK, artists);
  }

  /** create new artist */
  public async create(data: ArtistCreate, file: Express.Multer.File) {
    if (!!file) {
      data.coverImage = file.filename;
    }

    const artist = new ArtistModel(data);
    const newArtist = await artist.save();

    const newFolderPath = getAssetPath('songs', 'artists');
    // create folder to save his albums, the name is his id
    createAssetFolder(newFolderPath, newArtist.id);

    return this.response(HttpStatus.CREATED, newArtist);
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
