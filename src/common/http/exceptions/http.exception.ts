import { HttpStatus } from '@/common/enums';
import { CustomError } from 'ts-custom-error';

export class HttpException extends CustomError {
  public body!: any;
  public status!: HttpStatus;

  constructor(status: HttpStatus, message: any) {
    super();

    this.body = message;
    this.status = status;
  }
}
