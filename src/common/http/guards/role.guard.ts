import { RoleType } from '@/typings/shared.typing';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '@/common/enums';

/** route guard by user role */
export function roleGuard(role: RoleType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    if (!user) {
      console.error('role guard should be called next to auth guard');
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json('internal server error');
    }

    if (role !== user.role) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json("you don't have permission to access this resource");
    }

    next();
  };
}
