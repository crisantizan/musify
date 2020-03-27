import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { AlbumService } from './album.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';
import { validationPipe } from '@/common/http/pipes';
import { albumSchema } from '@/common/joi-schemas';
import { uploadAlbumImageMiddleware } from '@/common/http/middlewares/upload-images.middleware';
import { removeAsset } from '@/helpers/multer.helper';

export class AlbumController extends Controller implements IController {
  public readonly route = '/albums';

  constructor(private readonly albumService = new AlbumService()) {
    super();

    super.initRoutes(this.routes());
  }

  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [
        {
          path: '/',
          middlewares: [authGuard],
          handler: this.getAll.bind(this),
        },
      ],
      post: [
        // create a new album
        {
          path: '/',
          middlewares: [
            authGuard,
            roleGuard('ADMIN'),
            uploadAlbumImageMiddleware,
            await validationPipe(albumSchema),
          ],
          handler: this.create.bind(this),
        },
      ],
    };
  }

  private async getAll(req: Request, res: Response) {
    try {
      const result = await this.albumService.getAll();

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] create a new album */
  private async create(req: Request, res: Response) {
    try {
      const result = await this.albumService.create(req.body, req.file);
      return this.sendResponse(result, res);
    } catch (error) {
      if (!!req.file) {
        // remove image upladed
        await removeAsset(req.file.path);
      }

      this.handleError(error, res);
    }
  }
}
