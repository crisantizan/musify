import UserModel, { UserDocument } from '@/models/user.model';
import { UserCreate, UserLogin } from './user.type';
import { EncryptService } from '@/services/encrypt.service';
import { serviceResponse } from '@/helpers/service-response.helper';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { errorFieldObject } from '@/helpers/shared.helper';
import { ServiceResponse } from '@/typings/shared.typing';

export class UserService {
  /** get all users */
  public async getAll(): Promise<ServiceResponse<UserDocument[]>> {
    const users = await UserModel.find();
    return serviceResponse(HttpStatus.OK, users);
  }

  /** get one user */
  public async getOne(id: string) {
    const user = await UserModel.findById(id);

    if (!user) {
      return serviceResponse(HttpStatus.NOT_FOUND, 'user not found');
    }

    return serviceResponse(HttpStatus.OK, user);
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

  /** user login */
  public async login({ email, password }: UserLogin) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw serviceResponse(HttpStatus.NOT_FOUND, 'user not found');
    }

    if (!EncryptService.compareHash(password, user.password)) {
      throw serviceResponse(HttpStatus.FORBIDDEN, 'incorrect credentials');
    }

    return serviceResponse(HttpStatus.OK, user);
  }
}
