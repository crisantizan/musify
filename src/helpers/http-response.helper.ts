import { HttpStatus } from '@/common/enums/http-status.enum';

interface HttpResponse<T> {
  code: HttpStatus;
  message: T;
}

export function httpResponse<T>(code: HttpStatus, message: T): HttpResponse<T> {
  return { code, message };
}
