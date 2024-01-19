import { GameHistoriesRequest } from '@app/classes/communication/request';
import GameHistoriesService from '@app/services/game-history-service/game-history.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { UserRequest } from '@app/types/user';

@Service()
export class GameHistoriesController extends BaseController {
    constructor(private gameHistoriesService: GameHistoriesService) {
        super('/api/gameHistories');
    }

    protected configure(router: Router): void {
        router.get('/', async (req: UserRequest, res: Response, next) => {
            try {
                const result = await this.gameHistoriesService.getGameHistory(req.body.idUser);
                res.status(StatusCodes.OK).json(result);
            } catch (exception) {
                next(exception);
            }
        });

        router.delete('/', async (req: GameHistoriesRequest, res: Response, next) => {
            try {
                await this.handleGameHistoriesReset();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleGameHistoriesReset(): Promise<void> {
        await this.gameHistoriesService.resetGameHistories();
    }
}
