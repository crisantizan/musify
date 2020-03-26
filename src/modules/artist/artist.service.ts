import { Service } from '@/services';
import { ArtistCreate } from './artist.type';
import { ArtistModel } from '@/models';
import { HttpStatus } from '@/common/enums';

export class ArtistService extends Service {
  constructor() {
    super();
  }

  /** create new artist */
  public async create(data: ArtistCreate) {
    const artist = new ArtistModel(data);
    const newArtist = await artist.save();

    return this.response(HttpStatus.CREATED, newArtist);
  }
}
