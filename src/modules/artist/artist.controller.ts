import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { ArtistService } from './artist.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';
import { Role, HttpStatus } from '@/common/enums';
import { validationPipe } from '@/common/http/pipes';
import { artistSchema } from '@/common/joi-schemas';
import { uploadArtistImageMiddleware } from '@/common/http/middlewares/upload-images.middleware';
import { artistUpdateSchema } from '@/common/joi-schemas/artist-update.squema';
import { PaginationOptions } from '@/typings/shared.typing';
import { artistPaginationSchema } from '@/common/joi-schemas/artist-paginate.schema';
import { getAssetPath, transformPath } from '@/helpers/multer.helper';

export class ArtistController extends Controller implements IController {
  public readonly route: string = '/artists';

  constructor(private readonly artistService = new ArtistService()) {
    super();
    super.initRoutes(this.routes());
  }

  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [
        // get artist: pagination, filter and sort by name
        {
          path: '/',
          middlewares: [
            authGuard,
            await validationPipe(artistPaginationSchema, 'query'),
          ],
          handler: this.getAll.bind(this),
        },
        // get artist cover image
        {
          path: '/cover/:imagePath',
          middlewares: [authGuard],
          handler: this.getCoverImage.bind(this),
        },
        // get one artist with his albums
        {
          path: '/:artistId',
          middlewares: [authGuard],
          handler: this.getOne.bind(this),
        },
      ],
      post: [
        // create a new artist
        {
          path: '/',
          middlewares: [
            authGuard,
            roleGuard(Role.ADMIN),
            uploadArtistImageMiddleware,
            await validationPipe(artistSchema),
          ],
          handler: this.create.bind(this),
        },
      ],
      put: [
        // update artist data
        {
          path: '/:artistId',
          middlewares: [
            authGuard,
            roleGuard(Role.ADMIN),
            uploadArtistImageMiddleware,
            await validationPipe(artistUpdateSchema),
          ],
          handler: this.update.bind(this),
        },
      ],
    };
  }

  /** [GET] get all artists */
  private async getAll(req: Request, res: Response) {
    try {
      const pagination: PaginationOptions = req.query;

      const result = await this.artistService.getAll(pagination);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get one artist with his albums */
  public async getOne(req: Request, res: Response) {
    try {
      const result = await this.artistService.getOne(req.params.artistId);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get artist cover image */
  private async getCoverImage(req: Request, res: Response) {
    try {
      const path = getAssetPath(
        'ARTISTS',
        transformPath(req.params.imagePath, 'decode'),
      );

      res.status(HttpStatus.OK).sendFile(path);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] create a new artist */
  private async create(req: Request, res: Response) {
    try {
      const result = await this.artistService.create(req.body, req.file);
      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [PUT] update artist data */
  private async update(req: Request, res: Response) {
    try {
      const result = await this.artistService.update(
        req.params.artistId,
        req.body,
        req.file,
      );

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
