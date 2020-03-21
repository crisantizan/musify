import { JwtPayloadData } from './typings/jwt.typing';

declare module 'express-serve-static-core' {
  interface Request {
    user: JwtPayloadData;
  }
}
