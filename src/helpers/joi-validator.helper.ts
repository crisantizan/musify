import { ObjectSchema, ValidationError } from '@hapi/joi';
import { httpResponse } from './http-response.helper';
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
    throw httpResponse(HttpStatus.BAD_REQUEST, mapErrors(error));
  }
}

function mapErrors(error: ValidationError) {
  return error.details.map(err =>
    errorFieldObject(err.context?.label!, err.message),
  );
}
