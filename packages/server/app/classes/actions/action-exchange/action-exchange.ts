import ActionPlay from '@app/classes/actions/abstract-actions/action-play';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { ActionData, ActionExchangePayload } from '@app/classes/communication/action-data';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { ActionType } from '@common/models/action';

export default class ActionExchange extends ActionPlay {
    private tilesToExchange: Tile[];

    constructor(player: Player, game: Game, tilesToExchange: Tile[]) {
        super(player, game);
        this.tilesToExchange = tilesToExchange;
    }

    static createActionData(tiles: Tile[]): ActionData {
        return {
            type: ActionType.EXCHANGE,
            payload: this.createActionExchangePayload(tiles),
            input: '',
        };
    }

    static createActionExchangePayload(tiles: Tile[]): ActionExchangePayload {
        return { tiles };
    }

    execute(): GameUpdateData {
        const [tilesToExchange, unusedTiles] = ActionUtils.getTilesFromPlayer(this.tilesToExchange, this.player);

        const newTiles = this.game.swapTilesFromReserve(tilesToExchange);
        this.player.tiles = unusedTiles.concat(newTiles);

        const playerUpdate: PlayerData = { id: this.player.id, tiles: this.player.tiles };

        const response: GameUpdateData = {};

        fillPlayerData(response, this.game.getPlayerNumber(this.player), playerUpdate);

        return response;
    }

    getMessage(): FeedbackMessage {
        return { message: `Vous avez échangé ${this.tilesToExchange.length === 1 ? 'la tuile' : 'les tuiles'} ${this.lettersToSwap()}` };
    }

    getOpponentMessage(): FeedbackMessage {
        return {
            message: `${this.player.publicUser.username} a échangé ${this.tilesToExchange.length} tuile${this.tilesToExchange.length > 1 ? 's' : ''}`,
        };
    }

    private lettersToSwap(): string {
        return `${this.tilesToExchange.reduce((prev, tile) => prev + tile.letter, '')}`;
    }
}
