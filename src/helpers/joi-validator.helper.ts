import { ObjectSchema, ValidationError } from '@hapi/joi';
import { serviceResponse } from './service.helper';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { errorFieldObject } from './shared.helper';

export async function joiValidator<T>(
  schema: ObjectSchema<T>,
  object: T,
): Promise<T> {
  try {
    return await schema.validateAsync(object, {
      stripUnknown: true,
      abortEarly: false,
    });
  } catch (error) {
    throw serviceResponse(HttpStatus.BAD_REQUEST, mapErrors(error));
  }
}

function mapErrors(error: ValidationError) {
  return error.details.map(err =>
    errorFieldObject(err.context?.label!, err.message.replace(/["]+/g, '')),
  );
}
