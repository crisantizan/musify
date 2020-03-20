import { Router } from 'express';
import { HttpStatus } from '@/common/enums/http-status.enum';

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

/** props to return (for every field) when error has ocurred in a field */
export interface ErrorFieldObject {
  field: string;
  message: string;
}

/** properties to return by a service http */
export interface ServiceResponse<T> {
  code: HttpStatus;
  response: T;
}

/** roles allowed values */
export type RoleType = 'ADMIN' | 'USER';
