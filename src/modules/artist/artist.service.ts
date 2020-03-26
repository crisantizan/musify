import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel } from '@/models';
import { HttpStatus } from '@/common/enums';
import { getAssetPath, createAssetFolder } from '@/helpers/multer.helper';

export class ArtistService extends Service {
  constructor() {
    super();
  }

  /** create new artist */
  public async create(data: ArtistCreate) {
    const artist = new ArtistModel(data);
    const newArtist = await artist.save();
    const folderPath = getAssetPath('songs', 'artists');
    // create folder, the name is his id
    createAssetFolder(folderPath, newArtist.id);

    return this.response(HttpStatus.CREATED, newArtist);
  }
}
