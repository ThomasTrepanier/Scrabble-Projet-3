import Player from '@app/classes/player/player';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import { VIRTUAL_PLAYER_NAMES } from '@app/constants/virtual-player-constants';
import { Random } from '@app/utils/random/random';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { Service } from 'typedi';

@Service()
export class VirtualPlayerFactory {
    generateVirtualPlayer(gameId: string, virtualPlayerLevel: VirtualPlayerLevel, playersInGame: Player[], avatar: string = ''): Player {
        return virtualPlayerLevel === VirtualPlayerLevel.Beginner
            ? new BeginnerVirtualPlayer(gameId, this.getRandomVirtualPlayerName(playersInGame), avatar)
            : new ExpertVirtualPlayer(gameId, this.getRandomVirtualPlayerName(playersInGame), avatar);
    }

    private getRandomVirtualPlayerName(players: Player[]): string {
        const usedNames = players.map((player) => player.publicUser.username);
        const possibleNames = VIRTUAL_PLAYER_NAMES.filter((name) => !usedNames.includes(name));
        return Random.getRandomElementsFromArray(possibleNames)[0];
    }
}
