import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { VirtualPlayer } from '@common/models/virtual-player';

export const MOCK_PLAYER_PROFILES: VirtualPlayer[] = [
    {
        name: 'Jean Charest',
        idVirtualPlayer: 1,
        level: VirtualPlayerLevel.Beginner,
        isDefault: false,
    },
    {
        name: 'Jean Charest Jr',
        idVirtualPlayer: 2,
        level: VirtualPlayerLevel.Beginner,
        isDefault: false,
    },
    {
        name: 'Thomas "The best" Trépanier',
        idVirtualPlayer: 3,
        level: VirtualPlayerLevel.Expert,
        isDefault: false,
    },
];

export const MOCK_PLAYER_PROFILE_MAP: Map<VirtualPlayerLevel, string[]> = new Map([
    [VirtualPlayerLevel.Beginner, [MOCK_PLAYER_PROFILES[0].name, MOCK_PLAYER_PROFILES[1].name]],
    [VirtualPlayerLevel.Expert, [MOCK_PLAYER_PROFILES[2].name]],
]);
