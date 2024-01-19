import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import { StatusCodes } from 'http-status-codes';

export const fillPlayerData = (gameUpdateData: GameUpdateData, playerNumber: number, playerData: PlayerData) => {
    switch (playerNumber) {
        case 1: {
            gameUpdateData.player1 = playerData;
            break;
        }
        case 2: {
            gameUpdateData.player2 = playerData;
            break;
        }
        case 3: {
            gameUpdateData.player3 = playerData;
            break;
        }
        case 4: {
            gameUpdateData.player4 = playerData;
            break;
        }
        default: {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
    }
};
