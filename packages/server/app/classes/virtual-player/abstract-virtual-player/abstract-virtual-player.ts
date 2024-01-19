import { Board } from '@app/classes/board';
import { ActionData } from '@app/classes/communication/action-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import Range from '@app/classes/range/range';
import { AbstractWordFinding, ScoredWordPlacement, WordFindingRequest } from '@app/classes/word-finding';
import { FINAL_WAIT_TIME, PRELIMINARY_WAIT_TIME, VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { Delay } from '@app/utils/delay/delay';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

export abstract class AbstractVirtualPlayer extends Player {
    gameId: string;
    pointHistory: Map<number, number>;

    protected wordFindingInstance: AbstractWordFinding;
    private wordFindingService: WordFindingService;
    private activeGameService: ActiveGameService;
    private virtualPlayerService: VirtualPlayerService;

    constructor(gameId: string, name: string, avatar: string = '') {
        super(VIRTUAL_PLAYER_ID_PREFIX + uuidv4(), { username: name, avatar, email: '' });
        this.pointHistory = new Map<number, number>();
        this.gameId = gameId;
        this.wordFindingService = Container.get(WordFindingService);
        this.activeGameService = Container.get(ActiveGameService);
        this.virtualPlayerService = Container.get(VirtualPlayerService);
    }

    getVirtualPlayerService(): VirtualPlayerService {
        return this.virtualPlayerService;
    }

    getWordFindingService(): WordFindingService {
        return this.wordFindingService;
    }

    getActiveGameService(): ActiveGameService {
        return this.activeGameService;
    }

    getGameBoard(gameId: string, playerId: string): Board {
        return this.getActiveGameService().getGame(gameId, playerId).board;
    }
    getGame(gameId: string, playerId: string): Game {
        return this.getActiveGameService().getGame(gameId, playerId);
    }

    async playTurn(): Promise<void> {
        const waitPreliminaryTime = async (): Promise<void> => {
            await Delay.for(PRELIMINARY_WAIT_TIME);
        };
        const waitFinalTime = async (): Promise<void> => {
            await Delay.for(FINAL_WAIT_TIME);
        };
        const play = async (): Promise<[ActionData, void]> => {
            return Promise.all([this.findAction(), waitPreliminaryTime()]);
        };
        const actionResult: [ActionData, void] | void = await Promise.race([play(), waitFinalTime()]);
        this.getVirtualPlayerService().sendAction(this.gameId, this.id, actionResult ? actionResult[0] : this.alternativeMove());
    }

    protected getDictionaryId(gameId: string, playerId: string): string {
        return this.getActiveGameService().getGame(gameId, playerId).dictionarySummary.id;
    }

    protected computeWordPlacement(): ScoredWordPlacement | undefined {
        const request = this.generateWordFindingRequest();
        this.wordFindingInstance = this.getWordFindingService().getWordFindingInstance(request.useCase, this.getDictionaryId(this.gameId, this.id), [
            this.getGameBoard(this.gameId, this.id),
            this.tiles,
            request,
        ]);
        return this.wordFindingInstance.findWords().pop();
    }

    protected abstract isExchangePossible(): boolean;

    protected abstract findAction(): Promise<ActionData>;

    protected abstract generateWordFindingRequest(): WordFindingRequest;

    protected abstract findPointRange(): Range;

    protected abstract alternativeMove(): ActionData;
}
