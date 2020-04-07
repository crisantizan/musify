import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { AlbumService } from './album.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';
import { validationPipe } from '@/common/http/pipes';
import {
  albumSchema,
  albumUpdateSchema,
  albumPaginationSchema,
} from '@/common/joi-schemas';
import { uploadAlbumImageMiddleware } from '@/common/http/middlewares/upload-images.middleware';
import {
  removeAsset,
  getAssetPath,
  transformPath,
} from '@/helpers/multer.helper';
import { HttpStatus } from '@/common/enums';

export class AlbumController extends Controller implements IController {
  public readonly route = '/albums';

  constructor(private readonly albumService = new AlbumService()) {
    super();

    super.initRoutes(this.routes());
  }

  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [
        // search albums and paginate
        {
          path: '/',
          middlewares: [
            authGuard,
            await validationPipe(albumPaginationSchema, 'query'),
          ],
          handler: this.searchAndPaginate.bind(this),
        },
        // get artist cover image
        {
          path: '/cover/:imagePath',
          middlewares: [authGuard],
          handler: this.getCoverImage.bind(this),
        },
        // get one album and his songs
        {
          path: '/:albumId',
          middlewares: [authGuard],
          handler: this.getOne.bind(this),
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
      put: [
        // update an album
        {
          path: '/:albumId',
          middlewares: [
            authGuard,
            roleGuard('ADMIN'),
            uploadAlbumImageMiddleware,
            await validationPipe(albumUpdateSchema),
          ],
          handler: this.update.bind(this),
        },
      ],
      delete: [
        // remove an album
        {
          path: '/:albumId',
          middlewares: [authGuard, roleGuard('ADMIN')],
          handler: this.remove.bind(this),
        },
      ],
    };
  }

  /** search albums and paginate */
  private async searchAndPaginate(req: Request, res: Response) {
    try {
      const result = await this.albumService.searchAndPaginate(req.query);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get album cover image */
  private async getCoverImage(req: Request, res: Response) {
    try {
      const path = getAssetPath(
        'ARTISTS',
        // decode path
        transformPath(req.params.imagePath, 'decode'),
      );

      res.status(HttpStatus.OK).sendFile(path);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get one album and his songs */
  private async getOne(req: Request, res: Response) {
    try {
      const result = await this.albumService.getOne(req.params.albumId);

      this.sendResponse(result, res);
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

  /** [PUT] update album */
  private async update(req: Request, res: Response) {
    try {
      const {
        params: { albumId },
        body,
        file,
      } = req;

      const result = await this.albumService.update(albumId, body, file);
      return this.sendResponse(result, res);
    } catch (error) {
      if (!!req.file && !!error.name && error.name !== 'REMOVE_ASSET') {
        // remove image upladed
        await removeAsset(req.file.path);
      }

      this.handleError(error, res);
    }
  }

  /** [DELETE] remove an album */
  public async remove(req: Request, res: Response) {
    try {
      const result = await this.albumService.remove(req.params.albumId);

      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
