import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_TOKEN, TOKEN_INVALID } from '@app/constants/services-errors';
import { env } from '@app/utils/environment/environment';
import { doesRequestComeFromVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    if (doesRequestComeFromVirtualPlayer(req.url)) return next();

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new HttpException(NO_TOKEN, StatusCodes.NOT_ACCEPTABLE));
    }

    try {
        const idUser = Number(jwt.verify(token, env.TOKEN_SECRET));

        req.body = { ...req.body, idUser };
        next();
    } catch (error) {
        next(new HttpException(TOKEN_INVALID, StatusCodes.NOT_ACCEPTABLE));
    }
};
