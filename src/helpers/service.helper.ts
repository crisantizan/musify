import { HttpStatus } from '@/common/enums/http-status.enum';
import { ServiceResponse, Index } from '@/typings/shared.typing';
import { extname } from 'path';

/** generate properties to return by a service http */
export function serviceResponse<T>(
  code: HttpStatus,
  response: T,
): ServiceResponse<T> {
  return { code, response };
}

/** verify if values object properties are equals at schema */
export function isEquals(values: any, schema: any, ...skip: string[]) {
  const keys = !skip.length
    ? Object.keys(values)
    : Object.keys(values).filter(key => skip.every(v => v !== key));

  return (
    !!keys.length &&
    keys.every(key => schema[key].toLowerCase() === values[key].toLowerCase())
  );
}

/** replace object property values with "newValues" */
export function mergeObject<T>(newValues: any, schema: T) {
  Object.keys(newValues).forEach(key => {
    if (!!(schema as any)[key] || (schema as any)[key] === null) {
      (schema as any)[key] = newValues[key];
    }
  });

  return schema as T;
}

/** verify if a object is empty */
export function objectIsEmpty(obj: Object) {
  return Object.keys(obj).length === 0;
}

/** remove undefined properties */
export function removeUndefinedProps(obj: Index<any>) {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
}

/** generate asset file name: audio or image */
export function assetFileName(type: 'audio' | 'image', name: string) {
  return `${type}${extname(name)}`;
}
