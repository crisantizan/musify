import { Service } from '@/services';
import { AlbumCreate } from './album.type';
import { AlbumModel, ArtistModel, SongModel } from '@/models';
import { MulterFile, PaginationAlbumOptions } from '@/typings/shared.typing';
import {
  getAssetPath,
  createAssetFolder,
  removeAsset,
} from '@/helpers/multer.helper';
import { HttpStatus } from '@/common/enums';
import { getMongooseSession } from '@/db/session';
import {
  objectIsEmpty,
  isEquals,
  mergeObject,
  removeUndefinedProps,
} from '@/helpers/service.helper';

export class AlbumService extends Service {
  constructor() {
    super();
  }

  /** get an album and his songs */
  public async getOne(albumId: string) {
    const album = await AlbumModel.findById(albumId).lean();

    if (!album) {
      throw this.response(HttpStatus.NOT_FOUND, 'album not found');
    }

    // get his songs
    const songs = await SongModel.find({ album: album._id })
      .select('id name number duration file')
      .lean();

    return this.response(HttpStatus.OK, { ...album, songs });
  }

  /** search albums and paginate */
  public async searchAndPaginate({
    limit = 10,
    page = 1,
    byArtist,
    title,
    year,
  }: PaginationAlbumOptions) {
    // filter
    const query: any =
      !!byArtist || !!title || !!year
        ? {
            artist: byArtist,
            title: !!title ? new RegExp(title, 'i') : undefined,
            year,
          }
        : {};

    removeUndefinedProps(query);

    const albums = await AlbumModel.paginate(query, {
      page,
      limit,
      lean: true,
      select: 'id title year artist coverImage',
      sort: 'title',
      populate: { path: 'artist', select: 'id name' },
    });

    return this.response(HttpStatus.OK, albums);
  }

  /** create a new album */
  public async create(data: AlbumCreate, file: MulterFile) {
    if (!!file) {
      data.coverImage = file.filename;
    }

    // verify artist
    if (!(await ArtistModel.exists({ _id: data.artist }))) {
      throw this.response(HttpStatus.BAD_REQUEST, "the artist doesn't exist");
    }

    const album = new AlbumModel(data);

    const newAlbum = await album.save();
    return this.response(HttpStatus.CREATED, newAlbum);
  }

  /** update album */
  public async update(
    albumId: string,
    data: Partial<AlbumCreate>,
    file?: MulterFile,
  ) {
    if (objectIsEmpty(data)) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'at least one field must be sent',
      );
    }

    const album = await AlbumModel.findById(albumId);

    // verify existence of album
    if (!album) {
      throw this.response(HttpStatus.NOT_FOUND, "album doesn't exists");
    }

    // if the same data has been sent
    if (!file && isEquals(data, album)) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'the same data has been sent',
      );
    }

    let oldImage = album.coverImage;

    // add new image
    if (!!file) {
      // assign new image
      data.coverImage = file.filename;
    }

    await album.update(data);

    // delete old image of disk if other has been established
    if (!!oldImage && !!file) {
      const path = getAssetPath('IMAGES_ALBUMS');
      await removeAsset(path, oldImage);
    }

    return this.response(HttpStatus.OK, mergeObject(data, album));
  }
}
