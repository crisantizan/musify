import { Request, Response, NextFunction } from 'express';
import { unlink as removeFile } from 'fs-extra';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { UserService } from './user.service';
import { UserLogin, UserCreate } from './user.type';
import { Controller } from '../controller';
import { authGuard } from '@/common/http/guards/auth.guard';
import { multerMiddleware } from '@/common/http/middlewares/multer.middleware';
import { multerImageFilter } from '@/helpers/multer.helper';
import { kilobytesTobytes } from '@/helpers/shared.helper';
import { roleGuard } from '@/common/http/guards/role.guard';
import { Role } from '@/common/enums';
import { uploadUserImageMiddleware } from '@/common/http/middlewares/upload-user-image.middleware';

export class UserController extends Controller implements IController {
  public route: string = '/users';

  constructor(private readonly userService = new UserService()) {
    super();
    // initialize routes
    super.initRoutes(this.routes());
  }

  /**
   * important: use .bind(this) in all methods that you use
   */
  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [
        // get all users
        {
          path: '/',
          middlewares: [authGuard],
          handler: this.getAll.bind(this),
        },
        // get user
        {
          path: '/:id',
          middlewares: [authGuard],
          handler: this.getOne.bind(this),
        },
      ],
      post: [
        // create user
        {
          path: '/',
          middlewares: [authGuard, roleGuard(Role.ADMIN)],
          handler: this.createUser.bind(this),
        },
        // user login
        {
          path: '/login',
          handler: this.login.bind(this),
        },
        // user logout
        {
          path: '/logout',
          middlewares: [authGuard],
          handler: this.logout.bind(this),
        },
        // upload user image
        {
          path: '/upload-avatar',
          middlewares: [authGuard, uploadUserImageMiddleware],
          handler: this.uploadAvatar.bind(this),
        },
      ],
      put: [
        // update user data
        {
          path: '/',
          middlewares: [authGuard, uploadUserImageMiddleware],
          handler: this.update.bind(this),
        },
      ],
    };
  }

  /** create a new user */
  private async createUser({ body }: Request, res: Response) {
    try {
      const result = await this.userService.save(body as UserCreate);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all users */
  private async getAll(req: Request, res: Response) {
    try {
      const result = await this.userService.getAll();

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all users */
  private async getOne(req: Request, res: Response) {
    try {
      const result = await this.userService.getOne(req.params.id);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] upload user avatar */
  private async uploadAvatar(req: Request, res: Response) {
    // console.log({ file: req.file, userId: req.params });
    res.json('works!');
  }

  /** [POST] user login */
  private async login({ body }: Request, res: Response) {
    try {
      const result = await this.userService.login(body as UserLogin);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] user logout */
  private async logout({ user }: Request, res: Response) {
    try {
      const result = await this.userService.logout(user.id);

      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [PUT] update user data */
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.update(
        req.user.id,
        req.body,
        req.file,
      );

      this.sendResponse(result, res);
    } catch (error) {
      // remove image upladed
      await removeFile(req.file.path);
      this.handleError(error, res);
    }
  }
}
