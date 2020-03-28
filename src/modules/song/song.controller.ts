import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { SongService } from './song.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';

export class SongController extends Controller implements IController {
  public readonly route: string = '/songs';

  constructor(private readonly songService = new SongService()) {
    super();
    super.initRoutes(this.routes());
  }

  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [
        {
          path: '/',
          middlewares: [authGuard, roleGuard('ADMIN')],
          handler: this.getAll.bind(this),
        },
      ],
    };
  }

  /** [GET] get all */
  private async getAll(req: Request, res: Response) {
    res.status(200).json('works!');
  }

  /** [POST] create an song */
  private async create(req: Request, res: Response) {
    try {
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
