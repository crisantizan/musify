import { RoleType } from './shared.typing';
import { JwtHeader } from 'jsonwebtoken';

/** data saved in jwt payload */
export interface JwtPayloadData {
  id: string;
  role: RoleType;
}

/** payload to save in a jwt */
export interface PayloadJwt {
  data: JwtPayloadData;
  iat?: number;
  exp?: number;
}

/** jwt keys */
export interface JwtKeys {
  private: Buffer;
  public: Buffer;
}

/** data returned by decoded method of jsonwbtoken library */
export interface DecodedJwtToken {
  header: JwtHeader;
  payload: PayloadJwt;
  signature: string;
}

/** data returned when verify method is used */
export interface JwtVerifyData {
  data: JwtPayloadData;
  newToken?: string;
}
