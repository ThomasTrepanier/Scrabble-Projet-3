import { HttpException } from '@app/classes/http-exception/http-exception';
import { env } from '@app/utils/environment/environment';
import { ErrorResponse } from '@common/models/error';
import * as express from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = error instanceof HttpException ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

    const response: ErrorResponse = {
        message: error.message,
        error: getReasonPhrase(status),
        validationErrors: error instanceof HttpException ? error.validationErrors : [],
    };

    res.locals.message = error.message;
    res.locals.error = env.isDev ? error : {};

    if (env.isDev) {
        response.stack = error.stack?.split('\n');
    }

    if (!env.isProd) {
        // eslint-disable-next-line no-console
        console.error('\x1b[1m\x1b[3m<< Handled error >>\x1b[0m', error);
    }

    res.status(status).json(response);
};
