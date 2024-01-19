import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import Range from '@app/classes/range/range';
import { Tile } from '@app/classes/tile';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { ScoredWordPlacement, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import {
    EXCHANGE_ACTION_THRESHOLD,
    HIGH_SCORE_RANGE_MAX,
    HIGH_SCORE_RANGE_MIN,
    LOW_SCORE_RANGE_MAX,
    LOW_SCORE_RANGE_MIN,
    LOW_SCORE_THRESHOLD,
    MEDIUM_SCORE_RANGE_MAX,
    MEDIUM_SCORE_RANGE_MIN,
    MEDIUM_SCORE_THRESHOLD,
    MINIMUM_TILES_LEFT_FOR_EXCHANGE,
    PLACE_ACTION_THRESHOLD,
} from '@app/constants/virtual-player-constants';
import { BEGINNER_PLAYER_RATING } from '@app/services/active-game-service/active-game.service';
import { Random } from '@app/utils/random/random';

export class BeginnerVirtualPlayer extends AbstractVirtualPlayer {
    constructor(gameId: string, name: string, avatar: string = '') {
        super(gameId, name, avatar);
        this.initialRating = BEGINNER_PLAYER_RATING;
        this.adjustedRating = BEGINNER_PLAYER_RATING;
    }
    protected isExchangePossible(): boolean {
        const totalTilesLeft = this.getActiveGameService().getGame(this.gameId, this.id).getTotalTilesLeft();
        return totalTilesLeft >= MINIMUM_TILES_LEFT_FOR_EXCHANGE;
    }

    protected async findAction(): Promise<ActionData> {
        const randomAction = Math.random();
        if (randomAction <= PLACE_ACTION_THRESHOLD) {
            const scoredWordPlacement = this.computeWordPlacement();
            if (scoredWordPlacement) {
                this.updateHistory(scoredWordPlacement);
                return ActionPlace.createActionData(scoredWordPlacement);
            }
            return ActionPass.createActionData();
        }
        if (randomAction <= EXCHANGE_ACTION_THRESHOLD && this.isExchangePossible()) {
            return ActionExchange.createActionData(this.selectRandomTiles());
        }
        return ActionPass.createActionData();
    }

    protected findPointRange(): Range {
        const randomPointRange = Math.random();
        if (randomPointRange <= LOW_SCORE_THRESHOLD) {
            return new Range(LOW_SCORE_RANGE_MIN, LOW_SCORE_RANGE_MAX);
        } else if (randomPointRange <= MEDIUM_SCORE_THRESHOLD) {
            return new Range(MEDIUM_SCORE_RANGE_MIN, MEDIUM_SCORE_RANGE_MAX);
        } else {
            return new Range(HIGH_SCORE_RANGE_MIN, HIGH_SCORE_RANGE_MAX);
        }
    }

    protected alternativeMove(): ActionData {
        if (this.wordFindingInstance) {
            const bestMove = this.wordFindingInstance.wordPlacements.pop();
            if (bestMove) {
                this.updateHistory(bestMove);
                return ActionPlace.createActionData(bestMove);
            }
        }
        return ActionPass.createActionData();
    }

    protected generateWordFindingRequest(): WordFindingRequest {
        return {
            pointRange: this.findPointRange(),
            useCase: WordFindingUseCase.Beginner,
            pointHistory: this.pointHistory,
        };
    }

    private updateHistory(scoredWordPlacement: ScoredWordPlacement): void {
        const scoreCount = this.pointHistory.get(scoredWordPlacement.score);
        this.pointHistory.set(scoredWordPlacement.score, scoreCount ? scoreCount + 1 : 1);
    }

    private selectRandomTiles(): Tile[] {
        return Random.getRandomElementsFromArray(this.tiles, Math.ceil(Math.random() * this.tiles.length));
    }
}
