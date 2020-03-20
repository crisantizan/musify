import { readFileSync } from 'fs';
import { join } from 'path';
import { JwtPayloadData, PayloadJwt, JwtKeys } from '@/typings/jwt.typing';
import { SignOptions, sign, verify as verifyToken } from 'jsonwebtoken';
import { RedisService } from './redis.service';
import { serviceResponse } from '@/helpers/service-response.helper';
import { HttpStatus } from '@/common/enums';

export class JwtService {
  private readonly keys!: JwtKeys;
  private readonly redisService!: RedisService;

  constructor() {
    const path = join(__dirname, '..', 'assets', 'rsa-keys');

    // load keys values
    this.keys = {
      private: readFileSync(join(path, 'private.key')),
      public: readFileSync(join(path, 'public.key')),
    };

    this.redisService = new RedisService();
  }

  /** create a new jwt */
  public async create(data: JwtPayloadData, expiresIn: number | string) {
    return new Promise((resolve, reject) => {
      const payload: PayloadJwt = { data };

      const options: SignOptions = {
        algorithm: 'RS256',
        expiresIn,
      };

      return resolve(sign(payload, this.keys.private, options));
    });
  }

  /** verify token integrity */
  public async verify(token: string): Promise<JwtPayloadData> {
    try {
      // get user data in token payload
      const { data } = verifyToken(token, this.keys.public, {
        algorithms: ['RS256'],
      }) as PayloadJwt;

      // get user redis key
      const { redisUserKey } = this.redisService.generateUserkey(data.id);

      // get user redis token
      const redisToken = await this.redisService.get(redisUserKey);

      // session has been closes
      if (!redisToken) {
        return Promise.reject(
          serviceResponse(
            HttpStatus.FORBIDDEN,
            'invalid token, please login again',
          ),
        );
      }

      // token is corrupt or expired
      if (redisToken !== token) {
        return Promise.reject(
          serviceResponse(
            HttpStatus.FORBIDDEN,
            'token is corrupt, please login again',
          ),
        );
      }

      return Promise.resolve(data);
    } catch (err) {
      const expirateErr = 'TokenExpiredError';

      // token is corrupt
      if (err.name !== expirateErr) {
        return Promise.reject(
          serviceResponse(
            HttpStatus.FORBIDDEN,
            'invalid token, please login again',
          ),
        );
      }

      // generate a new token
      return Promise.reject();
    }
  }
}
