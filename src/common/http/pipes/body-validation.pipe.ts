import { NextFunction, Response, Request } from 'express';
import { joiValidator } from '@/helpers/joi-validator.helper';
import { ObjectSchema } from '@hapi/joi';

type RequestValidationType = 'body' | 'query';

/** validate «body» or «query» property of request */
export async function validationPipe<T>(
  schema: ObjectSchema<T>,
  type: RequestValidationType = 'body',
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await joiValidator(schema, req[type]);
      // body or querys
      req[type] = data;
      // update data (sanitaize if comes no-defined properties)
      next();
    } catch (error) {
      res.status(error.code).json(error.response);
    }
  };
}
