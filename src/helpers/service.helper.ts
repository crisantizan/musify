import { HttpStatus } from '@/common/enums/http-status.enum';
import { ServiceResponse } from '@/typings/shared.typing';

/** generate properties to return by a service http */
export function serviceResponse<T>(
  code: HttpStatus,
  response: T,
): ServiceResponse<T> {
  return { code, response };
}

/** verify if values object properties are equals at schema */
export function isEquals(values: any, schema: any) {
  return Object.keys(values).every(key => schema[key] === values[key]);
}
