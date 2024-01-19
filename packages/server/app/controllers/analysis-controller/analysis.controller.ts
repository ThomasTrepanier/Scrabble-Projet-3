import { GameRequest } from '@app/classes/communication/request';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { BaseController } from '@app/controllers/base-controller';
import { UserId } from '@app/classes/user/connected-user-types';
import { AnalysisPersistenceService } from '@app/services/analysis-persistence-service/analysis-persistence.service';
import { Analysis, AnalysisData, AnalysisRequestInfoType } from '@common/models/analysis';
import { GameHistory } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';

@Service()
export class AnalysisController extends BaseController {
    constructor(private analysisPersistenceService: AnalysisPersistenceService) {
        super('/api/analysis');
    }

    protected configure(router: Router): void {
        router.get('/:id', async (req: GameRequest, res: Response, next) => {
            const { id } = req.params;
            const requestType = req.query.requestType;
            const userId: UserId = req.body.idUser;

            try {
                const analysis = await this.handleRequestAnalysis(parseInt(id, 10), userId, requestType as AnalysisRequestInfoType);
                res.status(StatusCodes.OK).send(analysis);
            } catch (exception) {
                next(exception);
            }
        });
    }

    private async handleRequestAnalysis(
        id: TypeOfId<GameHistory> | TypeOfId<AnalysisData>,
        userId: UserId,
        requestType: AnalysisRequestInfoType,
    ): Promise<Analysis> {
        if (requestType === AnalysisRequestInfoType.ID_ANALYSIS) {
            return await this.analysisPersistenceService.requestAnalysis(await this.analysisPersistenceService.getIdGame(id, userId), userId);
        }
        return await this.analysisPersistenceService.requestAnalysis(id, userId);
    }
}
