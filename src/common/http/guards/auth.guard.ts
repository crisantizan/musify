import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '@/common/enums';
import { JwtService } from '@/services/jwt.service';
import { ServiceResponse } from '@/typings/shared.typing';

const jwtService = new JwtService();

/** protect route/s with a jwt validation */
export async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers['authorization'];

  if (!header) {
    console.log('sin cabecera');
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json('authorization header is required');
  }

  const [type, token] = header.split(' ');

  // only accept bearer token
  if (type.toLowerCase() !== 'bearer') {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json('authorization token should be of the bearer type');
  }

  if (!token) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json('authorization token is required');
  }

  // validate token integrity
  try {
    const { data, newToken } = await jwtService.verify(token);
    console.log({ data, newToken });
    // publish user data in the request object
    req.user = data;
    // if there is new token
    if (!!newToken) {
      console.log('there is a new token', newToken);
      res.setHeader('x-token', newToken);
    }

    next();
  } catch (error) {
    const { code, response } = error as ServiceResponse<any>;
    res.status(code).json(response);
  }
}
