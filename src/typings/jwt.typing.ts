import { RoleType } from './shared.typing';

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
