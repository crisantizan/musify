import { Service } from '@/services';
import { AlbumCreate } from './album.type';
import { AlbumModel, ArtistModel } from '@/models';
import { MulterFile } from '@/typings/shared.typing';
import {
  getAssetPath,
  createAssetFolder,
  removeAsset,
} from '@/helpers/multer.helper';
import { HttpStatus } from '@/common/enums';
import { getMongooseSession } from '@/db/session';

export class AlbumService extends Service {
  constructor() {
    super();
  }

  public async getAll() {
    const albums = await AlbumModel.find();

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
}
