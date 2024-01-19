/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { PlayerData } from '@app/classes/communication/';
import { Tile } from '@app/classes/tile';
import { PublicUser } from '@common/models/user';
import { Player } from '.';

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };
const USER5 = { username: 'user5', email: 'email5', avatar: 'avatar5' };
const USER6 = { username: 'user6', email: 'email6', avatar: 'avatar6' };
describe('Player', () => {
    const playerDataTestCases: PlayerData[] = [
        {
            publicUser: USER1,
            id: 'testId2',
            newId: 'testId2',
            score: 10,
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            publicUser: USER2,
            id: 'testId2',
            score: 10,
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            id: 'test',
            publicUser: USER3,
            score: 10,
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            publicUser: USER4,
            id: 'testId2',
            tiles: [{ letter: 'Z', value: 10 }],
        },
        {
            publicUser: USER5,
            id: 'testId2',
            score: 10,
        },
    ];

    it('Creating Player should initialize attributes', () => {
        const id = 'testId';
        const tiles: Tile[] = [{ letter: 'A', value: 10 }];
        const player = new Player(id, USER1, tiles);
        expect(player.id).toEqual(id);
        expect(player.publicUser).toEqual(USER1);
        expect(player['tiles']).toEqual(tiles);
    });

    it('Creating Player should not set tiles attribute to same reference', () => {
        const id = 'testId';
        const tiles: Tile[] = [
            { letter: 'A', value: 10 },
            { letter: 'B', value: 10 },
        ];
        const player = new Player(id, USER1, tiles);
        expect(player['tiles'] === tiles).toBeFalsy();
    });

    it('getTiles should return player tiles', () => {
        const id = 'testId';
        const tiles: Tile[] = [
            { letter: 'A', value: 10 },
            { letter: 'B', value: 10 },
        ];
        const player = new Player(id, USER1, tiles);
        expect(player['tiles']).toEqual(player.getTiles());
    });

    it('getTiles should return new instance of player tiles', () => {
        const id = 'testId';
        const tiles: Tile[] = [
            { letter: 'A', value: 10 },
            { letter: 'B', value: 10 },
        ];
        const player = new Player(id, USER1, tiles);
        // eslint-disable-next-line dot-notation
        expect(player['tiles'] === player.getTiles()).toBeFalsy();
    });

    playerDataTestCases.forEach((testCase: PlayerData) => {
        it('Update data should actualize player data', () => {
            const initId = 'testId1';
            const initTiles: Tile[] = [];
            const initPublicUser: PublicUser = USER6;
            const player = new Player(initId, USER6, initTiles);
            player.updatePlayerData(testCase);

            if (testCase.newId) {
                expect(player.id).toEqual(testCase.newId);
            } else {
                expect(player.id).toEqual(initId);
            }

            if (testCase.publicUser) {
                expect(player.publicUser).toEqual(testCase.publicUser);
            } else {
                expect(player.publicUser).toEqual(initPublicUser);
            }

            if (testCase.score) {
                expect(player.score).toEqual(testCase.score);
            } else {
                expect(player.score).toEqual(0);
            }

            if (testCase.tiles) {
                expect(player.getTiles()).toEqual(testCase.tiles);
                expect(player['tiles'] === testCase.tiles).toBeFalsy();
            } else {
                expect(player.getTiles()).toEqual(initTiles);
            }
        });
    });
});
