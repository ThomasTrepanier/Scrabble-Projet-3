import { ActionPass } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { StartGameData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { CONTENT_TYPE, GAME_SHOULD_CONTAIN_ROUND } from '@app/constants/virtual-player-constants';
import { env } from '@app/utils/environment/environment';
import { StatusCodes } from 'http-status-codes';
import fetch, { Response } from 'node-fetch';
import { Service } from 'typedi';

@Service()
export class VirtualPlayerService {
    async sendAction(gameId: string, playerId: string, action: ActionData): Promise<Response> {
        let response = await this.sendFetchRequest(gameId, playerId, action);
        // If an error occurs at reception of the request, send an ActionPass to prevent server from crashing
        if (response.status !== StatusCodes.NO_CONTENT) {
            response = await this.sendFetchRequest(gameId, playerId, ActionPass.createActionData());
        }
        return response;
    }

    triggerVirtualPlayerTurn(data: StartGameData | GameUpdateData, game: Game): void {
        if (!data.round) throw new HttpException(GAME_SHOULD_CONTAIN_ROUND, StatusCodes.INTERNAL_SERVER_ERROR);
        const virtualPlayer = game.getPlayer(data.round.playerData.id) as AbstractVirtualPlayer;
        virtualPlayer.playTurn();
    }

    private getEndPoint(): string {
        return env.SERVER_URL;
    }

    private async sendFetchRequest(gameId: string, playerId: string, action: ActionData): Promise<Response> {
        return fetch(`${this.getEndPoint()}/games/${gameId}/players/virtual-player-action`, {
            method: 'POST',
            headers: { [CONTENT_TYPE]: 'application/json' },
            body: JSON.stringify({ virtualPlayerId: playerId, ...action }),
        });
    }
}
