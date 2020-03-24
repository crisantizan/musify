import { Response, Router } from 'express';
import { ServiceResponse } from '@/typings/shared.typing';
import { HttpStatus } from '@/common/enums';
import { ControllerRoutes } from '@/typings/controller.typing';
import { HttpMethodType } from '@/typings/http.typing';
import { HttpMethod } from '@/common/enums/http-methods.enum';

/** shared methods to controllers */
export class Controller {
  public router: Router = Router();

  private readonly _httpMethods: HttpMethodType[] = [
    HttpMethod.GET,
    HttpMethod.POST,
    HttpMethod.PUT,
    HttpMethod.DELETE,
    HttpMethod.PATCH,
    HttpMethod.OPTIONS,
    HttpMethod.HEAD,
    HttpMethod.CONNECT,
    HttpMethod.TRACE,
  ];

  /** get only http methods allowed */
  private _sanitizeHttpMethods(routes: ControllerRoutes) {
    return Object.keys(routes).filter(method =>
      this._httpMethods.some(v => v === method && !!routes[method]?.length),
    );
  }

  /** ------------- METHODS TO CHILDREN INHERIT ------------- */

  /** initialize controller routes */
  protected async initRoutes(values: Promise<ControllerRoutes>) {
    const routes = await values;

    // validate http methods
    const methods = this._sanitizeHttpMethods(routes);

    methods.forEach(method => {
      routes[method]!.forEach(route => {
        // method here can be: get, post, put, delete etc (it prevet no-valid http methods)
        (this.router as any)[method](
          route.path,
          ...(!!route.middlewares ? route.middlewares : []),
          route.handler,
        );
      });
    });
  }

  protected handleError(error: any, res: Response) {
    // custom error
    if (error.hasOwnProperty('code')) {
      const { code, response } = error as ServiceResponse<string>;
      return res.status(code).json(response);
    }

    // internal server error
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
  }

  /** send response to client */
  protected sendResponse<T>(data: ServiceResponse<T>, res: Response) {
    return res.status(data.code).json(data.response);
  }
}
