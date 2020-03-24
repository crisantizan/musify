import db from 'mongoose';
import UserModel, { UserDocument } from '@/models/user.model';
import { UserCreate, UserLogin } from './user.type';
import { EncryptService } from '@/services/encrypt.service';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { errorFieldObject } from '@/helpers/shared.helper';
import { ServiceResponse } from '@/typings/shared.typing';
import { Service } from '@/services/service';
import { JwtService } from '@/services/jwt.service';
import { RedisService } from '@/services/redis.service';
import { Role } from '@/common/enums';
import { removeImage } from '@/helpers/multer.helper';

export class UserService extends Service {
  constructor(
    private readonly jwtService = new JwtService(),
    private readonly redisService = new RedisService(),
  ) {
    super();
  }
  /** get all users */
  public async getAll(): Promise<ServiceResponse<UserDocument[]>> {
    const users = await UserModel.find();
    return this.response(HttpStatus.OK, users);
  }

  /** get one user */
  public async getOne(id: string) {
    const user = await UserModel.findById(id);

    if (!user) {
      throw this.response(HttpStatus.NOT_FOUND, 'user not found');
    }

    return this.response(HttpStatus.OK, user);
  }

  /** save a new user */
  public async save(data: UserCreate) {
    // verify si the new user is a admin
    if (data.role === 'ADMIN') {
      // count admin
      const quantity = await UserModel.count({ role: Role.ADMIN });

      if (quantity > 0) {
        throw this.response(
          HttpStatus.BAD_REQUEST,
          'the administrator type user already exists, there should only be one',
        );
      }

      // allow create admin
    }

    if (await this.emailExists(data.email)) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        errorFieldObject('email', 'email passed already exists'),
      );
    }

    // set image property as null
    const model = new UserModel({ ...data, image: null });
    const user = await model.save();

    return this.response(HttpStatus.CREATED, user);
  }

  /** validate existence of the email passed */
  private async emailExists(email: string) {
    return await UserModel.exists({ email });
  }

  /** user login */
  public async login({ email, password }: UserLogin) {
    const user = await UserModel.findOne({ email });

    if (!user || !EncryptService.compareHash(password, user.password)) {
      throw this.response(HttpStatus.FORBIDDEN, 'incorrect credentials');
    }

    // create token for 15 days
    const token = await this.jwtService.create(
      { id: user.id, role: user.role },
      '15d',
    );

    const { redisUserKey } = this.redisService.generateUserkey(user.id);

    // save token in redis
    await this.redisService.set(redisUserKey, token);

    return this.response(HttpStatus.OK, { user, token });
  }

  /** user logout */
  public async logout(userId: string) {
    const { redisUserKey } = this.redisService.generateUserkey(userId);

    // remove from the redis
    await this.redisService.del(redisUserKey);

    return this.response(HttpStatus.OK, 'logout sucessfully');
  }

  /** user update */
  public async update(
    userId: string,
    data: Partial<UserCreate>,
    file?: Express.Multer.File,
  ) {
    const session = await db.startSession();
    session.startTransaction();
    try {
      const user = await UserModel.findById(userId);

      await user?.update({ name: 'NEW NAME EDIT' }).session(session);

      if (!!user?.name) {
        throw 'ggg debe abortar';
      }

      await user?.update({ surname: 'NEW SURNAME' }).session(session);
      await session.commitTransaction();

      return this.response(200, 'holi');
    } catch (error) {
      await session.abortTransaction();
      return this.response(405, error);
    } finally {
      session.endSession();
    }

    if (!Object.keys(data).length) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'at least one field must be sent',
      );
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        'user not found, please login again',
      );
    }

    // add new image
    // if (!!file) {
    //   // delete old image of disk
    //   if (!!user.image) {
    //     await removeImage(user.image, 'avatars');
    //   }

    //   // assign new image
    //   data.image = file.filename;
    // }

    // // update
    // const result = await user.update(data);

    // return this.response(
    //   HttpStatus.OK,
    //   !!result.nModified
    //     ? 'user updated successfully'
    //     : 'the same data has been sent',
    // );
  }
}
