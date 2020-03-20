import { readFileSync } from 'fs';
import { join } from 'path';
import { JwtPayloadData, PayloadJwt, JwtKeys } from '@/typings/jwt.typing';
import { SignOptions, sign } from 'jsonwebtoken';

export class JwtService {
  private readonly keys!: JwtKeys;

  constructor() {
    const path = join(__dirname, '..', 'assets', 'rsa-keys');

    // load keys values
    this.keys = {
      private: readFileSync(join(path, 'private.key')),
      public: readFileSync(join(path, 'public.key')),
    };
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
}
