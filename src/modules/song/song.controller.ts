import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { SongService } from './song.service';

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
          handler: this.getAll.bind(this),
        },
      ],
    };
  }

  /** [GET] get all */
  private async getAll(req: Request, res: Response) {
    res.status(200).json('works!');
  }
}
