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
}

export interface PaginationArtistOptions extends Object, PaginationOptions {
  /** get only by name */
  byName?: string;
}

export interface PaginationAlbumOptions extends Object, PaginationOptions {
  /** get only by artist */
  byArtist?: string;
  /** get coincidences with the album name */
  title?: string;
  /** get by release year */
  year?: number;
}

export interface PaginationSongOptions extends Object, PaginationOptions {
  /** get by album */
  album?: string;
  /** get by title */
  name?: string;
}

export type MulterFile = Express.Multer.File;
