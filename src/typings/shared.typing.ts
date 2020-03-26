import { Document, PaginateModel } from 'mongoose';
import { HttpStatus } from '@/common/enums/http-status.enum';

/** add index signature */
export interface Index<T> {
  [key: string]: T;
}

/** environment mode */
export type EnvMode = 'development' | 'production';

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

export interface PaginationModel<T extends Document> extends PaginateModel<T> {}

/** properties to generate pagination */
export interface PaginationOptions extends Object {
  /** items per page */
  limit?: number;
  /** current page */
  page?: number;
  /** get only by name */
  byName?: string;
}
