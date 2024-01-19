import { body } from 'express-validator';
import { validator } from '@app/middlewares/validator';

export const wordPlacementValidator = (field: string | string[]) => validator(body(field).exists().bail(), body(field).isArray());
