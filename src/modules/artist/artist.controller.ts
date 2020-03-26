import { Controller } from '../controller';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { Request, Response } from 'express';
import { ArtistService } from './artist.service';
import { authGuard } from '@/common/http/guards/auth.guard';
import { roleGuard } from '@/common/http/guards/role.guard';
import { Role } from '@/common/enums';
import { bodyValidationPipe } from '@/common/http/pipes';
import { artistSchema } from '@/common/joi-schemas';

export class ArtistController extends Controller implements IController {
  public readonly route: string = '/artists';

  constructor(private readonly artistService = new ArtistService()) {
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
      post: [
        // create a new artist
        {
          path: '/',
          middlewares: [
            authGuard,
            roleGuard(Role.ADMIN),
            await bodyValidationPipe(artistSchema),
          ],
          handler: this.create.bind(this),
        },
      ],
    };
  }

  /** get all artists */
  private getAll(req: Request, res: Response) {
    res.status(200).json('works!');
  }

  /** [POST] create a new artist */
  private async create(req: Request, res: Response) {
    try {
      const result = await this.artistService.create(req.body);
      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
