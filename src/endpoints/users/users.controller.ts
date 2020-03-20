import { Request, Response } from 'express';
import { Router } from 'express';
import { Controller } from '@/typings/controller.typing';
import { UsersService } from './users.service';
import { HttpStatus } from '@/common/enums/http-status.enum';
import { bodyValidationPipe } from '@/common/pipes';
import { userSchema } from '@/common/joi-schemas';

export class UsersController implements Controller {
  public router: Router = Router();
  public route: string = '/users';
  private usersService!: UsersService;

  constructor() {
    this.usersService = new UsersService();
    this.initRoutes();
  }

  /**
   * important: use .bind(this) in all methods that you use
   */
  public initRoutes() {
    // get all users
    this.router.get('/', this.getAll.bind(this));
    // get one user
    this.router.get('/:id', this.getOne.bind(this));
    // create new user
    this.router.post(
      '/',
      // validate data received before create user
      (req, res, next) => bodyValidationPipe(req, res, next, userSchema),
      this.createUser.bind(this),
    );
  }

  /** create a new user */
  private async createUser({ body }: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.save(body);
      res.status(code).json(response);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /** get all users */
  private async getAll(req: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.getAll();
      return res.status(code).json(response);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }

  /** get all users */
  private async getOne(req: Request, res: Response) {
    try {
      const { code, response } = await this.usersService.getOne(req.params.id);
      return res.status(code).json(response);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}
