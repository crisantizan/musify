import { Request, Response } from 'express';
import { Router } from 'express';
import { IController } from '@/typings/controller.typing';
import { UserService } from './user.service';
import { bodyValidationPipe } from '@/common/http/pipes';
import { userSchema, userLoginSchema } from '@/common/joi-schemas';
import { UserLogin } from './user.type';
import { Controller } from '../controller';
import { authGuard } from '@/common/http/guards/auth.guard';

export class UserController extends Controller implements IController {
  public router: Router = Router();
  public route: string = '/users';
  private usersService!: UserService;

  constructor() {
    super();

    this.usersService = new UserService();
    this.initRoutes();
  }

  /**
   * important: use .bind(this) in all methods that you use
   */
  public initRoutes() {
    /** ----- GET ----- */
    // get all users
    this.router
      .get('/', authGuard, this.getAll.bind(this))
      // get one user
      .get('/:id', authGuard, this.getOne.bind(this))
      // create new user
      .post(
        '/',
        authGuard,
        // validate data received before create user
        (req, res, next) => bodyValidationPipe(req, res, next, userSchema),
        this.createUser.bind(this),
      )

      /** ----- POST ----- */
      // user login
      .post(
        '/login',
        // validate data received
        (req, res, next) => bodyValidationPipe(req, res, next, userLoginSchema),
        this.login.bind(this),
      );
  }

  /** create a new user */
  private async createUser({ body }: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.save(body);
      res.status(code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all users */
  private async getAll(req: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.getAll();
      return res.status(code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all users */
  private async getOne(req: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.getOne(req.params.id);
      return res.status(code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] login */
  private async login({ body }: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.login(
        body as UserLogin,
      );

      return res.status(code).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
