import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { SongService } from './song.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';
import { validationPipe } from '@/common/http/pipes';
import { songSchema } from '@/common/joi-schemas';
import { uploadSongMiddleware } from '@/common/http/middlewares/upload-songs.middleware';

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
      post: [
        {
          path: '/',
          middlewares: [
            authGuard,
            roleGuard('ADMIN'),
            uploadSongMiddleware,
            await validationPipe(songSchema),
          ],
          handler: this.create.bind(this),
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
      console.log(req.file);
      res.json('ok');
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
