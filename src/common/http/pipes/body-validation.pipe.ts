import { NextFunction, Response, Request } from 'express';
import { joiValidator } from '@/helpers/joi-validator.helper';
import { ObjectSchema } from '@hapi/joi';

/** validate properties of body section */
export async function bodyValidationPipe<T>(schema: ObjectSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await joiValidator(schema, req.body);
      req.body = data;
      // update body data (sanitaize if comes no-defined properties)
      next();
    } catch (error) {
      res.status(error.code).json(error.response);
    }
  };
}
