import { Request, Response, NextFunction } from 'express';
import { IController, ControllerRoutes } from '@/typings/controller.typing';
import { UserService } from './user.service';
import { UserLogin, UserCreate } from './user.type';
import { Controller } from '../controller';
import { authGuard } from '@/common/http/guards/auth.guard';
import {
  uploadUserImageMiddleware,
  uploadTempImageMiddleware,
} from '@/common/http/middlewares/upload-images.middleware';
import { validationPipe } from '@/common/http/pipes';
import { userUpdateSchema } from '@/common/joi-schemas/user-update.schema';
import { getAssetPath } from '@/helpers/multer.helper';
import { HttpStatus, Role } from '@/common/enums';
import { userLoginSchema, userSchema } from '@/common/joi-schemas';
import { roleGuard } from '@/common/http/guards/role.guard';
import { cloudService } from '@/services/cloudinary.service';

export class UserController extends Controller implements IController {
  public route: string = '/users';

  constructor(private readonly userService = new UserService()) {
    super();
    // initialize routes
    super.initRoutes(this.routes());
  }

  /**
   * important: use .bind(this) in all methods that you use
   */
  public async routes(): Promise<ControllerRoutes> {
    return {
      get: [
        // get all users
        {
          path: '/',
          // middlewares: [authGuard],
          handler: this.getAll.bind(this),
        },
        // who i'm
        {
          path: '/whoami',
          middlewares: [authGuard],
          handler: this.whoami.bind(this),
        },
        // get user image
        {
          path: '/image/:userImage',
          middlewares: [authGuard],
          handler: this.getImage.bind(this),
        },
        // get user
        {
          path: '/:id',
          middlewares: [authGuard],
          handler: this.getOne.bind(this),
        },
      ],
      post: [
        // create user
        {
          path: '/',
          middlewares: [authGuard, await validationPipe(userSchema)],
          handler: this.createUser.bind(this),
        },
        // user login
        {
          path: '/login',
          // use middlewares
          middlewares: [await validationPipe(userLoginSchema)],
          handler: this.login.bind(this),
        },
        // user logout
        {
          path: '/logout',
          middlewares: [authGuard],
          handler: this.logout.bind(this),
        },
        // upload user image
        {
          path: '/upload-avatar',
          middlewares: [authGuard, uploadUserImageMiddleware],
          handler: this.uploadAvatar.bind(this),
        },
        // upload in cloudinary
        {
          path: '/cloudinary',
          middlewares: [uploadTempImageMiddleware],
          handler: this.cloudinary.bind(this),
        },
      ],
      put: [
        // update user data
        {
          path: '/',
          middlewares: [
            authGuard,
            uploadUserImageMiddleware,
            await validationPipe(userUpdateSchema),
          ],
          handler: this.update.bind(this),
        },
      ],
    };
  }

  private async cloudinary(req: Request, res: Response) {
    try {
      // const result = await cloudService.uploader.upload(req.file.path, {
      //   folder: 'cisum-test/images',
      // });
      // const result = await cloudService.api.delete_all_resources({
      //   prefix: 'edit_solid',
      // });
      // const result = await cloudService.api.delete_resources_by_prefix(
      //   'artists/metallica',
      // );
      // const result = await cloudService.uploader.rename(
      //   'cisum/artists/metallica/album1',
      //   'cisum/artists/trivium/album1',
      // );
      const result = cloudService.url('cisum/users/dqwbyvipn8pwmixvzvhz', {
        height: 150,
        width: 150,
        crop: 'fill',
      });
      // const result = cloudService.image(
      //   'https://res.cloudinary.com/crisantizan/image/upload/v1586484858/cisum/users/dqwbyvipn8pwmixvzvhz.png',
      //   {
      //     height: 150,
      //     width: 150,
      //     crop: 'thumb',
      //   },
      // );
      // ROOT: cisum/
      // ARTIST: cisum/artists/artistId
      // ALBUM: cisum/artists/artistId/albums/albumId
      // SONG: cisum/artists/artistId/albums/albumId/songId
      // const result = await cloudService.api.delete_resources([
      //   'cisum-test/ncjsh23ssj28jcLkB/mobtzwcaurzuwewbhm9p',
      //   'cisum-test/ncjsh23ssj28jcLkB/adluoaysqqsnn18uq6il',
      // ]);
      // await cloudService.api.create_upload_preset()
      // const result = await (cloudService.api as any).delete_folder('cisum-test');
      // const result = await cloudService.uploader.destroy(
      //   'cisum-test/ncjsh23ssj28jcLkB',
      //   { type: 'folder' }
      // );
      //https://827919318754376:u4mozTFyOw8VVNT8Rma_h4_v-RM@api.cloudinary.com/v1_1/crisantizan/resources/image
      // console
      /**
       * https://cloudinary.com/console/api/v1/operations/delete_folder
       * {path: "hola", delete_resources: true, resources_limit: 1000}
       */
      // id artist: 8njhJhnl0oNj12
      // id album 1 jahanBhxgS5tSGhAAA8
      // id AKJknksjAJ
      // id album 2 akjNVjnasDHhJSJnkK
      // id KlAm9889JjN
      // id KSJnajHAH
      // id artist2 lakIksj76HnshaB
      res.json({ result });
    } catch (error) {
      console.log(error);
    }
  }

  /** create a new user */
  private async createUser({ body }: Request, res: Response) {
    try {
      const result = await this.userService.save(body as UserCreate);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] who i'm */
  private async whoami(req: Request, res: Response) {
    try {
      const result = await this.userService.whoami(req.user.id);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get user image */
  private async getImage(req: Request, res: Response) {
    try {
      const path = getAssetPath('IMAGES_USERS', req.params.userImage);

      res.status(HttpStatus.OK).sendFile(path);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all users */
  private async getAll(req: Request, res: Response) {
    try {
      const result = await this.userService.getAll();

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [GET] get all users */
  private async getOne(req: Request, res: Response) {
    try {
      const result = await this.userService.getOne(req.params.id);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] upload user avatar */
  private async uploadAvatar(req: Request, res: Response) {
    // console.log({ file: req.file, userId: req.params });
    res.json('works!');
  }

  /** [POST] user login */
  private async login({ body }: Request, res: Response) {
    try {
      const result = await this.userService.login(body as UserLogin);

      return this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [POST] user logout */
  private async logout({ user }: Request, res: Response) {
    try {
      const result = await this.userService.logout(user.id);

      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** [PUT] update user data */
  private async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.update(
        req.user.id,
        req.body,
        req.file,
      );

      this.sendResponse(result, res);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
