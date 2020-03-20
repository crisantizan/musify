import { NextFunction, Response, Request } from 'express';
import { joiValidator } from '@/helpers/joi-validator.helper';
import { ObjectSchema } from '@hapi/joi';

/** validate properties of body section */
export async function bodyValidationPipe<T>(
  req: Request,
  res: Response,
  next: NextFunction,
  schema: ObjectSchema<T>,
) {
  try {
    const data = await joiValidator(schema, req.body);
    // update body data (sanitaize if comes no-defined properties)
    req.body = data;
    next();
  } catch (error) {
    res.status(error.code).json(error.message);
  }
}
