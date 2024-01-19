import { WordPlacement } from '@common/models/word-finding';
import { BaseController } from '@app/controllers/base-controller';
import { wordPlacementValidator } from '@app/middlewares/validators/word-placement';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { UserRequest } from '@app/types/user';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { Position } from '@app/classes/board';
import { PuzzleResultStatus } from '@common/models/puzzle';

@Service()
export class PuzzleController extends BaseController {
    constructor(private readonly puzzleService: PuzzleService) {
        super('/api/puzzles');
    }

    protected configure(router: Router): void {
        router.post('/start', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).send(await this.puzzleService.startPuzzle(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.post('/daily/start', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).send(await this.puzzleService.startDailyPuzzle(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.post('/daily/is-completed', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).send({ isCompleted: !(await this.puzzleService.canDoDailyPuzzle(req.body.idUser)) });
            } catch (e) {
                next(e);
            }
        });

        router.post('/daily/leaderboard', async (req: UserRequest, res, next) => {
            try {
                res.status(StatusCodes.OK).send(await this.puzzleService.getDailyPuzzleLeaderboard(req.body.idUser));
            } catch (e) {
                next(e);
            }
        });

        router.post(
            '/complete',
            ...wordPlacementValidator('wordPlacement'),
            async (req: UserRequest<{ wordPlacement: WordPlacement }>, res, next) => {
                try {
                    res.status(StatusCodes.OK).send(
                        await this.puzzleService.completePuzzle(req.body.idUser, {
                            ...req.body.wordPlacement,
                            startPosition: Position.fromJson(req.body.wordPlacement.startPosition),
                        }),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post('/abandon', async (req: UserRequest<{ status?: PuzzleResultStatus }>, res, next) => {
            try {
                res.status(StatusCodes.OK).send(await this.puzzleService.abandonPuzzle(req.body.idUser, req.body.status));
            } catch (e) {
                next(e);
            }
        });
    }
}
