import { User } from '@common/models/user';
import { WithIdOf } from '@common/types/id';
import { Request } from 'express';

/* eslint-disable @typescript-eslint/ban-types */
export type UserBody<Body = object> = Body & WithIdOf<User>;
export type UserRequest<Body = object> = Request<object, object, UserBody<Body>>;
