import { Router } from 'express';
import { UserController } from './user.controller';

export function userRouter(router: Router, controller: UserController) {}

const routes = {
  post: [{ route: '/', middlewares: [], handler: 1 }],
  get: [],
  put: [],
  delete: [],
};
