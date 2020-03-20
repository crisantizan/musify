import UserModel, { UserDocument } from '@/models/user.model';
import { UserCreate } from './users.type';
import { EncryptService } from '@/services/encrypt.service';
import { httpResponse } from '@/helpers/http-response.helper';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { joiValidator } from '@/helpers/joi-validator.helper';
import { errorFieldObject } from '@/helpers/shared.helper';

export class UsersService {
  constructor() {}

  /** get all users simulation */
  public getAll(): string[] {
    return ['Juan', 'Álvaro', 'Luis'];
  }

  /** save a new user */
  public async save(data: UserCreate) {
    if (await this.emailExists(data.email)) {
      return httpResponse(
        HttpStatus.BAD_REQUEST,
        errorFieldObject('email', 'email passed already exists'),
      );
    }

    data.password = await EncryptService.createHash(data.password);
    const model = new UserModel(data);
    const user = await model.save();

    return httpResponse(HttpStatus.CREATED, user);
  }

  /** validate existence of the email passed */
  private async emailExists(email: string) {
    return await UserModel.exists({ email });
  }
}
