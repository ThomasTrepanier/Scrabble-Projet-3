import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_FIELD, INVALID_FIELDS } from '@app/constants/validator-errors';
import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export const validator = (...validators: ValidationChain[]) => [
    ...validators,
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return next(new HttpException(errors.array().length === 1 ? INVALID_FIELD : INVALID_FIELDS, StatusCodes.BAD_REQUEST, errors.array()));
        }

        next();
    },
];
