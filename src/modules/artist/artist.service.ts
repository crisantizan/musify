import { mongo } from 'mongoose';
import { join } from 'path';
import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import {
  getAssetPath,
  removeAsset,
  transformPath,
} from '@/helpers/multer.helper';
import { getMongooseSession } from '@/db/session';
import { isEquals, mergeObject } from '@/helpers/service.helper';
import { PaginationArtistOptions } from '@/typings/shared.typing';
import { move } from 'fs-extra';

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
      // path to save in database
      const pathToDB = join(artistId, file.filename);
      // final path
      const fullPath = getAssetPath('ARTISTS', pathToDB);
      // move from temp files to final folder
      await move(file.path, fullPath);

      data.coverImage = transformPath(pathToDB, 'encode');
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

    const oldImage = !!artist.coverImage
    ? transformPath(artist.coverImage!, 'decode')
    : '';

    // add new image
    if (!!file) {
      // path to save in database
      const pathToDB = join(artistId, file.filename);
      // final path
      const fullPath = getAssetPath('ARTISTS', pathToDB);
      // move from temp files to final folder
      await move(file.path, fullPath);

      // assign new image
      data.coverImage = transformPath(pathToDB, 'encode');
    }

    // update
    await artist.updateOne(data);

    // delete old image of disk if other has been established
    if (!!oldImage && !!file) {
      const path = getAssetPath('ARTISTS');
      await removeAsset(path, oldImage);
    }

    return this.response(HttpStatus.OK, mergeObject(data, artist));
  }
}
