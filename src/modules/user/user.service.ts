import UserModel, { UserDocument } from '@/models/user.model';
import { UserCreate, UserLogin } from './user.type';
import { EncryptService } from '@/services/encrypt.service';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { errorFieldObject } from '@/helpers/shared.helper';
import { ServiceResponse } from '@/typings/shared.typing';
import { Service } from '@/services/service';
import { JwtService } from '@/services/jwt.service';
import { RedisService } from '@/services/redis.service';

export class UserService extends Service {
  private readonly jwtService!: JwtService;
  private readonly redisService!: RedisService;

  constructor() {
    super();

    this.jwtService = new JwtService();
    this.redisService = new RedisService();
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
    if (await this.emailExists(data.email)) {
      throw this.response(
        HttpStatus.BAD_REQUEST,
        errorFieldObject('email', 'email passed already exists'),
      );
    }

    data.password = await EncryptService.createHash(data.password);
    const model = new UserModel(data);
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

    if (!user) {
      throw this.response(HttpStatus.NOT_FOUND, 'user not found');
    }

    if (!EncryptService.compareHash(password, user.password)) {
      throw this.response(HttpStatus.FORBIDDEN, 'incorrect credentials');
    }

    // create token for 20 days
    const token = await this.jwtService.create(
      { id: user.id, role: user.role },
      '15d',
    );

    const { redisUserKey } = this.redisService.generateUserkey(user.id);

    // save token in redis
    await this.redisService.set(redisUserKey, token);

    return this.response(HttpStatus.OK, { user, token });
  }
}
