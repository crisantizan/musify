import { HttpStatus } from '@/common/enums';
import { ServiceResponse } from '@/typings/shared.typing';
import { serviceResponse } from '@/helpers/service.helper';

/** shared methods to services */
export class Service {
  /** data to return for controllers */
  protected response<T>(code: HttpStatus, response: T): ServiceResponse<T> {
    return serviceResponse(code, response);
  }
}
