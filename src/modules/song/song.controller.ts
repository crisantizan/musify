import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { SongService } from './song.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';
import { uploadSongMiddleware } from '@/common/http/middlewares/upload-songs.middleware';
import { HttpStatus } from '@/common/enums';
import { validationPipe } from '@/common/http/pipes';
import { songSchema, songUpdateSchema } from '@/common/joi-schemas';
import { uploadTempImageMiddleware } from '@/common/http/middlewares/upload-images.middleware';
import { songPaginationSchema } from '@/common/joi-schemas/song-pagination.schema';

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
          middlewares: [authGuard, await validationPipe(songPaginationSchema)],
          handler: this.searchAngPaginate.bind(this),
        },
        // get one
        {
          path: '/:songId',
          middlewares: [authGuard],
          handler: this.getOne.bind(this),
        },
      ],
      post: [
        // create a new song
        {
          path: '/',
          middlewares: [
            authGuard,
            roleGuard('ADMIN'),
            uploadTempImageMiddleware,
            await validationPipe(songSchema),
          ],
          handler: this.create.bind(this),
        },
        // upload song
        {
          path: '/upload',
          middlewares: [authGuard, roleGuard('ADMIN'), uploadSongMiddleware],
          handler: this.uploadSong.bind(this),
        },
      ],
      put: [
        // update song
        {
          path: '/:songId',
          middlewares: [
            authGuard,
            roleGuard('ADMIN'),
            uploadTempImageMiddleware,
            await validationPipe(songUpdateSchema),
          ],
          handler: this.update.bind(this),
        },
      ],
      delete: [
        // remove a song
        {
          path: '/:songId',
          middlewares: [authGuard, roleGuard('ADMIN')],
          handler: this.remove.bind(this),
        },
      ],
    };
  }

  /** [GET] get one */
  private async getOne(req: Request, res: Response) {
    try {
      const result = await this.songService.getOne(req.params.songId);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all */
  private async searchAngPaginate(req: Request, res: Response) {
    try {
      const result = await this.songService.searchAndPaginate(req.query);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] create a song */
  private async create(req: Request, res: Response) {
    try {
      const result = await this.songService.create(req.body, req.file);
      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [PUT] update an song */
  private async update(req: Request, res: Response) {
    try {
      const result = await this.songService.update(
        req.params.songId,
        req.body,
        req.file,
      );

      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] create an song */
  private async uploadSong(req: Request, res: Response) {
    res.status(HttpStatus.CREATED).json(req.file.filename);
  }

  /** [DELETE] remove an song */
  private async remove(req: Request, res: Response) {
    try {
      const result = await this.songService.remove(req.params.songId);

      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
