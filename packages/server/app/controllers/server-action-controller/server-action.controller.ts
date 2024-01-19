import { BaseController } from '@app/controllers/base-controller';
import { ServerActionService } from '@app/services/server-action-service/server-action.service';
import { UserRequest } from '@app/types/user';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class ServerActionController extends BaseController {
    constructor(private readonly serverActionService: ServerActionService) {
        super('/api/server-actions');
    }

    protected configure(router: Router): void {
        router.get('/', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).json(await this.serverActionService.getActions(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });
    }
}
