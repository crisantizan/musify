import { Service } from '@/services';
import { mongo } from 'mongoose';
import { AlbumCreate } from './album.type';
import { AlbumModel, ArtistModel, SongModel } from '@/models';
import { MulterFile, PaginationAlbumOptions } from '@/typings/shared.typing';
import {
  getAssetPath,
  removeAsset,
  genAlbumUploadPath,
  transformPath,
} from '@/helpers/multer.helper';
import { HttpStatus } from '@/common/enums';
import {
  objectIsEmpty,
  isEquals,
  mergeObject,
  removeUndefinedProps,
} from '@/helpers/service.helper';
import { move } from 'fs-extra';

export class AlbumService extends Service {
  constructor() {
    super();
  }

  /** get an album and his songs */
  public async getOne(albumId: string) {
    const [album, songs] = await Promise.all([
      AlbumModel.findById(albumId).lean(),
      // get his songs
      SongModel.find({ album: albumId })
        .select('id name number duration coverImage file')
        .lean(),
    ]);

    if (!album) {
      throw this.response(HttpStatus.NOT_FOUND, 'album not found');
    }

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
    // verify artist
    if (!(await ArtistModel.exists({ _id: data.artist }))) {
      throw this.response(HttpStatus.BAD_REQUEST, "the artist doesn't exist");
    }

    const albumId = new mongo.ObjectId().toHexString();

    if (!!file) {
      // path to save in database
      const pathToBD = genAlbumUploadPath(
        data.artist as string,
        albumId,
        file.filename,
      );
      // final path
      const fullPath = getAssetPath('ARTISTS', pathToBD);

      // move from temp files to final folder
      await move(file.path, fullPath);

      data.coverImage = transformPath(pathToBD, 'encode');
    }

    const album = new AlbumModel({ _id: albumId, ...data });
    const newAlbum = await album.save();

    return this.response(HttpStatus.CREATED, newAlbum);
  }

  /** update album */
  public async update(
    albumId: string,
    data: Partial<AlbumCreate>,
    file?: MulterFile,
  ) {
    if (!file && objectIsEmpty(data)) {
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

    const oldImage = !!album.coverImage
      ? transformPath(album.coverImage!, 'decode')
      : '';

    // add new image
    if (!!file) {
      // path to save in database
      const pathToBD = genAlbumUploadPath(
        String(album.artist),
        String(album._id),
        file.filename,
      );
      // final path
      const fullPath = getAssetPath('ARTISTS', pathToBD);
      // move from temp files to final folder
      await move(file.path, fullPath);

      // assign new image
      data.coverImage = transformPath(pathToBD, 'encode');
    }

    await album.updateOne(data);

    // delete old image of disk if other has been established
    if (!!oldImage && !!file) {
      const path = getAssetPath('ARTISTS');
      await removeAsset(path, oldImage);
    }

    return this.response(HttpStatus.OK, mergeObject(data, album));
  }

  /** remove an album */
  public async remove(albumId: string) {
    const album = await AlbumModel.findByIdAndRemove(albumId);

    if (!album) {
      throw this.response(HttpStatus.NOT_FOUND, "album doesn't exists");
    }

    const path = genAlbumUploadPath(String(album.artist), albumId);
    await removeAsset(getAssetPath('ARTISTS', path));

    return this.response(HttpStatus.OK, 'album removed successfully!');
  }
}
