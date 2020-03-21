import { Router } from 'express';

/** methods and props that all controllers they should have */
export interface IController {
  /** express router */
  router: Router;
  /** route name that handle the controller */
  route: string;
  /** method to inicializate routes */
  initRoutes(): void;
}
