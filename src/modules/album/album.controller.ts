import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { AlbumService } from './album.service';

export class AlbumController extends Controller implements IController {
  public readonly route = '/albums';

  constructor(private readonly albumService = new AlbumService()) {
    super();

    super.initRoutes(this.routes());
  }

  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [{ path: '/', handler: this.getAll.bind(this) }],
    };
  }

  private async getAll(req: Request, res: Response) {
    res.status(200).json({ hellow: 'world' });
  }
}
