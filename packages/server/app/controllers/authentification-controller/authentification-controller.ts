import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_SIGNUP } from '@app/constants/controllers-errors';
import { BaseController } from '@app/controllers/base-controller';
import { authenticateToken } from '@app/middlewares/authentificate-token';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AuthentificationController extends BaseController {
    constructor(private readonly authentificationservice: AuthentificationService) {
        super('/api/authentification');
    }

    protected configure(router: Router): void {
        router.post('/login', async (req, res, next) => {
            this.authentificationservice
                .login(req.body)
                .then((session) => res.send(session).status(StatusCodes.OK).end())
                .catch((e) => next(e));
        });

        router.post('/signUp', async (req, res, next) => {
            this.authentificationservice
                .signUp(req.body)
                .then((session) => res.send(session).status(StatusCodes.CREATED).end())
                .catch((e) => next(e));
        });

        router.post('/validate', authenticateToken, async (req, res, next) => {
            this.authentificationservice
                .validate(req.body.idUser)
                .then((session) => res.send(session).status(StatusCodes.CREATED).end())
                .catch((e) => next(e));
        });

        router.post('/validateUsername', async (req, res, next) => {
            this.authentificationservice
                .validateUsername(req.body.username as string)
                .then((isAvailable) => res.send({ isAvailable }).status(StatusCodes.OK).end())
                .catch(() => next(new HttpException(NO_SIGNUP, StatusCodes.FORBIDDEN)));
        });

        router.post('/validateEmail', async (req, res, next) => {
            this.authentificationservice
                .validateEmail(req.body.email as string)
                .then((isAvailable) => res.send({ isAvailable }).status(StatusCodes.OK).end())
                .catch(() => next(new HttpException(NO_SIGNUP, StatusCodes.FORBIDDEN)));
        });
    }
}
