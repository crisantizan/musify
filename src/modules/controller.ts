import { Response } from 'express';
import { ServiceResponse } from '@/typings/shared.typing';
import { HttpStatus } from '@/common/enums';

/** shared methods to controllers */
export class Controller {
  protected handleError(error: any, res: Response) {
    // custom error
    if (error.hasOwnProperty('code')) {
      const { code, response } = error as ServiceResponse<string>;
      return res.status(code).json(response);
    }

    // internal server error
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}
