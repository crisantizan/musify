import UserModel, { UserDocument } from '@/models/user.model';
import { UserCreate, User } from './users.type';
import { EncryptService } from '@/services/encrypt.service';
import { serviceResponse } from '@/helpers/service-response.helper';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { errorFieldObject } from '@/helpers/shared.helper';
import { ServiceResponse } from '@/typings/shared.typing';

export class UsersService {
  /** get all users */
  public async getAll(): Promise<ServiceResponse<UserDocument[]>> {
    const users = await UserModel.find();
    return serviceResponse(HttpStatus.OK, users);
  }

  /** save a new user */
  public async save(data: UserCreate) {
    if (await this.emailExists(data.email)) {
      return serviceResponse(
        HttpStatus.BAD_REQUEST,
        errorFieldObject('email', 'email passed already exists'),
      );
    }

    data.password = await EncryptService.createHash(data.password);
    const model = new UserModel(data);
    const user = await model.save();

    return serviceResponse(HttpStatus.CREATED, user);
  }

  /** validate existence of the email passed */
  private async emailExists(email: string) {
    return await UserModel.exists({ email });
  }
}
