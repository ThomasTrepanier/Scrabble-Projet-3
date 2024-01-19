import { Router } from 'express';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { StatusCodes } from 'http-status-codes';
import { BaseController } from '@app/controllers/base-controller';

@Service()
export class DatabaseController extends BaseController {
    constructor(private readonly databaseService: DatabaseService) {
        super('/api/database');
    }

    protected configure(router: Router): void {
        router.get('/is-connected', async (req, res, next) => {
            try {
                await this.databaseService.pingDb();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                next(e);
            }
        });
    }
}
