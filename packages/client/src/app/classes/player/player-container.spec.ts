/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */

import { PlayerData } from '@app/classes/communication/';
import { DEFAULT_PLAYER } from '@app/constants/game-constants';
import { MISSING_PLAYER_DATA_TO_INITIALIZE, PLAYER_NUMBER_INVALID } from '@app/constants/services-errors';
import { UNKOWN_USER } from '@common/models/user';
import { Player } from '.';
import { PlayerContainer } from './player-container';

describe('PlayerContainer', () => {
    let playerContainer: PlayerContainer;

    const DEFAULT_LOCAL_PLAYER_ID = '1';
    const DEFAULT_PLAYER_NUMBER = 1;
    const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
    const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
    const testPlayers: Player[] = [new Player('1', USER1, []), new Player('2', USER2, [])];

    const initializeMap = (players: Player[]): Map<number, Player> => {
        const map = new Map();
        players.forEach((value: Player, index: number) => {
            map.set(index + 1, value);
        });
        return map;
    };
    beforeEach(() => {
        playerContainer = new PlayerContainer(DEFAULT_LOCAL_PLAYER_ID, false);
    });

    afterEach(() => {
        playerContainer = null as unknown as PlayerContainer;
    });

    it('Creating PlayerContainer should initialize and set localPlayerId', () => {
        expect(playerContainer['players']).toBeTruthy();
        expect(playerContainer['localPlayerId']).toEqual(DEFAULT_LOCAL_PLAYER_ID);
    });

    it('getLocalPlayerId should return localPlayerId', () => {
        expect(playerContainer.getLocalPlayerId()).toEqual(playerContainer['localPlayerId']);
    });

    it('getLocalPlayer should return player from container with same id as localPlayerId', () => {
        const localPlayer = new Player(DEFAULT_LOCAL_PLAYER_ID, UNKOWN_USER, []);
        playerContainer['players'].set(DEFAULT_PLAYER_NUMBER, localPlayer);

        expect(playerContainer.getLocalPlayer()).toEqual(localPlayer);
    });

    it('getLocalPlayer should return undefined if no player id matches localPlayerId', () => {
        const notLocalPlayer = new Player('not-local-player', UNKOWN_USER, []);
        playerContainer['players'].set(DEFAULT_PLAYER_NUMBER, notLocalPlayer);

        expect(playerContainer.getLocalPlayer()).toBeUndefined();
    });

    it('initializePlayer should call addPlayer if playerData is valid (1 player)', () => {
        const playerData: PlayerData = {
            id: '1',
            publicUser: UNKOWN_USER,
            tiles: [],
        };
        const spy = spyOn<any>(playerContainer, 'setPlayer').and.callFake(() => {
            return playerContainer;
        });

        playerContainer.initializePlayer(DEFAULT_PLAYER_NUMBER, playerData);
        expect(spy).toHaveBeenCalled();
    });

    it('initializePlayer should throw error if name is missing', () => {
        const playerData: PlayerData = {
            id: '1',
            tiles: [],
        };

        expect(() => playerContainer.initializePlayer(DEFAULT_PLAYER_NUMBER, playerData)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
    });

    it('initializePlayer should throw error if tiles are missing', () => {
        const playerData: PlayerData = {
            id: '1',
            publicUser: UNKOWN_USER,
        };

        expect(() => playerContainer.initializePlayer(DEFAULT_PLAYER_NUMBER, playerData)).toThrowError(MISSING_PLAYER_DATA_TO_INITIALIZE);
    });

    it('initializePlayers should call addPlayer if playerData is valid (2 players)', () => {
        const playerDatas: PlayerData[] = [
            {
                id: '1',
                publicUser: UNKOWN_USER,
                tiles: [],
            },
            {
                id: '2',
                publicUser: USER2,
                tiles: [],
            },
        ];
        const spy = spyOn(playerContainer, 'initializePlayer').and.callFake(() => {
            return playerContainer;
        });

        playerContainer.initializePlayers(playerDatas);

        const expectedData: [number, PlayerData][] = [
            [DEFAULT_PLAYER_NUMBER, playerDatas[0]],
            [DEFAULT_PLAYER_NUMBER + 1, playerDatas[1]],
        ];
        expectedData.forEach((data: [number, PlayerData]) => {
            expect(spy).toHaveBeenCalledWith(data[0], data[1]);
        });
    });

    it('getPlayer 1 should return the first player in the set', () => {
        playerContainer['players'] = initializeMap(testPlayers);

        expect(playerContainer.getPlayer(DEFAULT_PLAYER_NUMBER)).toEqual(testPlayers[0]);
    });

    it('getPlayer for player number not in set should throw error', () => {
        playerContainer['players'] = initializeMap(testPlayers);
        const outOfBoundNumber = playerContainer['players'].size + 1;

        expect(() => playerContainer.getPlayer(outOfBoundNumber)).toThrowError(PLAYER_NUMBER_INVALID(outOfBoundNumber));
    });

    it('addPlayer should add provided player to set', () => {
        const spy = spyOn(playerContainer['players'], 'set').and.callThrough();

        playerContainer['setPlayer'](1, DEFAULT_PLAYER);
        expect(spy).toHaveBeenCalledWith(1, DEFAULT_PLAYER);
    });

    it('resetPlayers should clear the set', () => {
        const spy = spyOn(playerContainer['players'], 'clear').and.callThrough();

        playerContainer['resetPlayers']();
        expect(spy).toHaveBeenCalledWith();
    });

    it('updatePlayersData should call updatePlayerData on players if the id matches', () => {
        const player1UpdateSpy = spyOn(testPlayers[0], 'updatePlayerData').and.callFake(() => {
            return;
        });
        const player2UpdateSpy = spyOn(testPlayers[1], 'updatePlayerData').and.callFake(() => {
            return;
        });
        const playerDatas: PlayerData[] = [
            {
                id: '1',
                publicUser: UNKOWN_USER,
            },
            {
                id: '2',
                publicUser: USER2,
            },
        ];

        playerContainer['players'] = initializeMap(testPlayers);

        playerContainer.updatePlayersData(...playerDatas);
        expect(player1UpdateSpy).toHaveBeenCalledWith(playerDatas[0]);
        expect(player2UpdateSpy).toHaveBeenCalledWith(playerDatas[1]);
    });
});
