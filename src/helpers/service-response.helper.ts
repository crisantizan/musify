import { HttpStatus } from '@/common/enums/http-status.enum';
import { ServiceResponse } from '@/typings/shared.typing';

/** generate properties to return by a service http */
export function serviceResponse<T>(
  code: HttpStatus,
  response: T,
): ServiceResponse<T> {
  return { code, response };
}
