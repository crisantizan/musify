import { Router, RequestParamHandler, RequestHandler } from 'express';
import { Index } from './shared.typing';

/** methods and props that all controllers they should have */
export interface IController {
  /** express router */
  router: Router;
  /** route name that handle the controller */
  route: string;
  /** method to inicializate routes */
  // initRoutes(): void;
}

/** data to define controller routes */
export interface ControllerRoutes extends Index<ControllerRoute[] | undefined> {
  get: ControllerRoute[];
  post?: ControllerRoute[];
  put?: ControllerRoute[];
  delete?: ControllerRoute[];
  patch?: ControllerRoute[];
  options?: ControllerRoute[];
  head?: ControllerRoute[];
  connect?: ControllerRoute[];
  trace?: ControllerRoute[];
}

/** data to define a one route in the controller routes property */
export interface ControllerRoute {
  /** path for this endponint */
  path: string;
  /** middlewares to apply */
  middlewares?: RequestHandler[];
  /** method that handle this request */
  handler: RequestHandler;
}

/** express router props in controllers */
export interface ControllerRouteProps {
  route: string;
  router: Router;
}
