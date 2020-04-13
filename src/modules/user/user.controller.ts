import { Request, Response, NextFunction } from 'express';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { UserService } from './user.service';
import { UserLogin, UserCreate } from './user.type';
import { Controller } from '../controller';
import { authGuard } from '@/common/http/guards/auth.guard';
import { validationPipe } from '@/common/http/pipes';
import { userUpdateSchema } from '@/common/joi-schemas/user-update.schema';
import { userLoginSchema, userSchema } from '@/common/joi-schemas';
import { uploadTempImageMiddleware } from '@/common/http/middlewares/upload-images.middleware';

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
          // middlewares: [authGuard],
          handler: this.getAll.bind(this),
        },
        // who i'm
        {
          path: '/whoami',
          middlewares: [authGuard],
          handler: this.whoami.bind(this),
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
          middlewares: [authGuard, await validationPipe(userSchema)],
          handler: this.createUser.bind(this),
        },
        // user login
        {
          path: '/login',
          // use middlewares
          middlewares: [await validationPipe(userLoginSchema)],
          handler: this.login.bind(this),
        },
        // user logout
        {
          path: '/logout',
          middlewares: [authGuard],
          handler: this.logout.bind(this),
        },
      ],
      put: [
        // update user data
        {
          path: '/',
          middlewares: [
            authGuard,
            uploadTempImageMiddleware,
            await validationPipe(userUpdateSchema),
          ],
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

  /** [GET] who i'm */
  private async whoami(req: Request, res: Response) {
    try {
      const result = await this.userService.whoami(req.user.id);

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
      this.handleError(error, res);
    }
  }
}
