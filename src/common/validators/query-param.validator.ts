import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../enums/http-status.enum';
import { errorFieldObject } from '@/helpers/shared.helper';

/** validate a query param */
export function queryParamValidator(
  req: Request,
  res: Response,
  next: NextFunction,
  prop: string,
) {
  const value = req.params[prop];
  if (typeof value === 'undefined') {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(errorFieldObject(prop, `param ${prop} is required`));
  }

  next();
}
