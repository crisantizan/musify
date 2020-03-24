import joi from '@hapi/joi';
import { UserCreate } from '@/modules/user/user.type';
import { Role } from '../enums';

/** joi user schema */
export const userUpdateSchema = joi.object<UserCreate>({
  name: joi.string().optional(),
  surname: joi.string().optional(),
  password: joi.string().optional(),
  email: joi
    .string()
    .optional()
    .email(),
  role: joi
    .string()
    .optional()
    .equal(Role.ADMIN, Role.USER),
});
