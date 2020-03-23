import { Router, RequestParamHandler, RequestHandler } from 'express';
import { Index } from './shared.typing';

/** methods and props that all controllers they should have */
export interface IController {
  /** express router */
  router: Router;
  /** route name that handle the controller */
  route: string;
  /** method to inicializate routes */
  initRoutes(): void;
}

/** data to define controller routes */
export interface ControllerRoutes extends Index<ControllerRoute[]> {
  get: ControllerRoute[];
  post: ControllerRoute[];
  put: ControllerRoute[];
  delete: ControllerRoute[];
  // define the others verbs if you prefer
}

/** data to define a one route in the controller routes property */
export interface ControllerRoute {
  /** path for this endponint */
  path: string;
  /** middlewares to apply */
  middlewares: RequestHandler[];
  /** method that handle this request */
  handler: RequestHandler;
}
