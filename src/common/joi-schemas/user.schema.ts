import joi from '@hapi/joi';
import { UserCreate } from '@/modules/user/user.type';
import { Role } from '../enums';

/** joi user schema */
export const userSchema = joi.object<UserCreate>({
  name: joi.string().required(),
  surname: joi.string().required(),
  password: joi.string().required(),
  email: joi
    .string()
    .required()
    .email(),
  role: joi
    .string()
    .required()
    .equal(Role.ADMIN, Role.USER),
});
