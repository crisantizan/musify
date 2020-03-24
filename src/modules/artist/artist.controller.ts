import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';

export class ArtistController extends Controller implements IController {
  public readonly route: string = '/artists';

  constructor() {
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

  /** get all artists */
  private getAll(req: Request, res: Response) {
    res.status(200).json('works!');
  }
}
