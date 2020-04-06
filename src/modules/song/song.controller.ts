const ms = require('mediaserver');
import { extname } from 'path';
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
import {
  getAssetPath,
  removeAsset,
  transformPath,
} from '@/helpers/multer.helper';

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
        // get cover image and audio file
        {
          path: '/file/:path',
          middlewares: [authGuard],
          handler: this.getCoverImageAndAudio.bind(this),
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
    };
  }

  /** [GET] get all */
  private async getAll(req: Request, res: Response) {
    res.status(200).json('works!');
  }

  /** [GET] get cover image and audio file */
  private async getCoverImageAndAudio(req: Request, res: Response) {
    try {
      const { path } = req.params;
      const ext = extname(path);

      const fullPath = getAssetPath(
        'ARTISTS',
        // decode path
        transformPath(req.params.path, 'decode'),
      );

      if (ext === '.mp3') {
        ms.pipe(req, res, fullPath);
        return;
      }

      res.status(HttpStatus.OK).sendFile(fullPath);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] create an song */
  private async create(req: Request, res: Response) {
    try {
      const result = await this.songService.create(req.body, req.file);
      this.sendResponse(result, res);
    } catch (error) {
      if (!!req.file) {
        const path = getAssetPath('TEMP_IMAGES', req.file.filename);
        // remove image recent uploaded
        await removeAsset(path);
      }
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
}
