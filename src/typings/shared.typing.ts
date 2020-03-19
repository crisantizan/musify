import { Router } from 'express';

/** environment mode */
export type EnvMode = 'development' | 'production';

/** express router props in controllers */
export interface ControllerRouteProps {
  route: string;
  router: Router;
}

/** mongoose timestamps fields */
export interface TimestampsFields {
  createdAt: Date;
  updatedAt: Date;
}
