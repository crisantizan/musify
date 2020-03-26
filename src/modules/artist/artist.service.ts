import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import { getAssetPath, createAssetFolder } from '@/helpers/multer.helper';

export class ArtistService extends Service {
  constructor() {
    super();
  }

  /** get all */
  public async getAll() {
    const artists =  await ArtistModel.find();
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
}
