/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import Player from '@app/classes/player/player';
import { GAME_ALREADY_FULL } from '@app/constants/classes-errors';
import { INVALID_PLAYER_ID_FOR_GAME, INVALID_TYPES } from '@app/constants/services-errors';
import { GameVisibility } from '@common/models/game-visibility';
import { Observer } from '@common/models/observer';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { GameConfig } from './game-config';
import WaitingRoom from './waiting-room';
const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const ID = 'id';
const ID2 = 'id2';
const ID3 = 'id3';
const ID4 = 'id4';
const DEFAULT_GAME_CHANNEL_ID = 1;
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };

describe('WaitingRoom', () => {
    describe('fillNextEmptySpot', () => {
        let room: WaitingRoom;
        let player: Player;

        beforeEach(() => {
            room = new WaitingRoom({} as unknown as GameConfig, DEFAULT_GAME_CHANNEL_ID);
            player = new Player(ID, USER1);
            player.tiles = [
                { value: 1, letter: 'A' },
                { value: 4, letter: 'B' },
                { value: 2, letter: 'A' },
                { value: 4, letter: 'D' },
            ];
        });

        it('should fill player 2 if it is undefined', () => {
            room.fillNextEmptySpot(player);
            expect(room.joinedPlayer2).to.equal(player);
            expect(room.joinedPlayer3).not.to.exist;
            expect(room.joinedPlayer4).not.to.exist;
        });

        it('should fill player 3 if it is undefined and 2 is defined', () => {
            room.joinedPlayer2 = {} as unknown as Player;
            room.fillNextEmptySpot(player);
            expect(room.joinedPlayer2).to.exist;
            expect(room.joinedPlayer3).to.equal(player);
            expect(room.joinedPlayer4).not.to.exist;
        });

        it('should fill player 4 if it is undefined and 2 and 3 is defined', () => {
            room.joinedPlayer2 = {} as unknown as Player;
            room.joinedPlayer3 = {} as unknown as Player;
            room.fillNextEmptySpot(player);
            expect(room.joinedPlayer2).to.exist;
            expect(room.joinedPlayer3).to.exist;
            expect(room.joinedPlayer4).to.equal(player);
        });
        it('should throw it is full', () => {
            room.joinedPlayer2 = {} as unknown as Player;
            room.joinedPlayer3 = {} as unknown as Player;
            room.joinedPlayer4 = {} as unknown as Player;
            const result = () => {
                room.fillNextEmptySpot(player);
            };
            expect(result).to.throw(GAME_ALREADY_FULL);
        });
    });

    describe('getPlayers', () => {
        let room: WaitingRoom;
        let player1: Player;
        let player2: Player;
        let player3: Player;
        let player4: Player;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            room = new WaitingRoom({ player1 } as unknown as GameConfig, DEFAULT_GAME_CHANNEL_ID);
            player2 = new Player(ID2, USER2);
            player3 = new Player(ID3, USER3);
            player4 = new Player(ID4, USER4);
            player1.tiles = [
                { value: 1, letter: 'A' },
                { value: 4, letter: 'B' },
                { value: 2, letter: 'A' },
                { value: 4, letter: 'D' },
            ];
        });

        it('should get all players', () => {
            room.joinedPlayer3 = player3;
            expect(room.getPlayers()).to.deep.equal([player1, player3]);
        });

        it('should get all players', () => {
            room.joinedPlayer2 = player2;
            room.joinedPlayer4 = player4;
            expect(room.getPlayers()).to.deep.equal([player1, player2, player4]);
        });
    });

    describe('convertToGroup', () => {
        let room: WaitingRoom;
        let player1: Player;
        let player2: Player;
        let player3: Player;
        let player4: Player;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            room = new WaitingRoom(
                {
                    player1,
                    maxRoundTime: 60,
                    gameVisibility: GameVisibility.Private,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    password: 'a',
                } as unknown as GameConfig,
                DEFAULT_GAME_CHANNEL_ID,
            );
            player2 = new Player(ID2, USER2);
            player3 = new Player(ID3, USER3);
            player4 = new Player(ID4, USER4);
            room.joinedPlayer2 = player2;
            room.joinedPlayer3 = player3;
            room.joinedPlayer4 = player4;
            player1.tiles = [
                { value: 1, letter: 'A' },
                { value: 4, letter: 'B' },
                { value: 2, letter: 'A' },
                { value: 4, letter: 'D' },
            ];
        });

        it('should convertToGroup', () => {
            room.joinedPlayer3 = player3;
            expect(room.convertToGroup()).to.deep.equal({
                user1: USER1,
                user2: USER2,
                user3: USER3,
                user4: USER4,
                maxRoundTime: 60,
                gameVisibility: GameVisibility.Private,
                virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                groupId: room.getId(),
                password: 'a',
                numberOfObservers: 0,
            });
        });
    });

    describe('addToRequesting', () => {
        let room: WaitingRoom;
        let player1: Player;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            room = new WaitingRoom(
                {
                    player1,
                    maxRoundTime: 60,
                    gameVisibility: GameVisibility.Private,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    password: 'a',
                } as unknown as GameConfig,
                DEFAULT_GAME_CHANNEL_ID,
            );
        });

        it('should add ToObservers if isObserver', () => {
            expect(room.requestingObservers.length).to.equal(0);
            expect(room.requestingPlayers.length).to.equal(0);
            room.addToRequesting(USER2, ID2, true);
            expect(room.requestingPlayers.length).to.equal(0);
            expect(room.requestingObservers.length).to.equal(1);
        });

        it('should add ToPlayers if not isObserver', () => {
            expect(room.requestingObservers.length).to.equal(0);
            expect(room.requestingPlayers.length).to.equal(0);
            room.addToRequesting(USER2, ID2, false);
            expect(room.requestingPlayers.length).to.equal(1);
            expect(room.requestingObservers.length).to.equal(0);
        });
    });

    describe('addToJoined', () => {
        let room: WaitingRoom;
        let player1: Player;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            room = new WaitingRoom(
                {
                    player1,
                    maxRoundTime: 60,
                    gameVisibility: GameVisibility.Private,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    password: 'a',
                } as unknown as GameConfig,
                DEFAULT_GAME_CHANNEL_ID,
            );
        });

        it('should add to joinedObservers if isObserver', () => {
            const spy = chai.spy.on(room, 'fillNextEmptySpot', () => {});
            expect(room.joinedObservers.length).to.equal(0);
            room.addToJoined(USER2, ID2, true);
            expect(spy).to.not.have.been.called();
            expect(room.joinedObservers.length).to.equal(1);
        });

        it('should call fillNextEmptySpot to joinedObservers if NOT isObserver', () => {
            const spy = chai.spy.on(room, 'fillNextEmptySpot', () => {});

            expect(room.joinedObservers.length).to.equal(0);
            room.addToJoined(USER2, ID2, false);
            expect(spy).to.have.been.called();
        });
    });

    describe('getFromRequesting', () => {
        let room: WaitingRoom;
        let player1: Player;
        let player2: Player;
        let observer1: Observer;
        let observer2: Observer;
        let observer3: Observer;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            player2 = new Player(ID2, USER2);
            observer1 = { id: ID3, publicUser: USER3 };
            observer2 = { id: ID4, publicUser: USER4 };
            observer3 = { id: ID2, publicUser: USER2 };
            room = new WaitingRoom(
                {
                    player1,
                    maxRoundTime: 60,
                    gameVisibility: GameVisibility.Private,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    password: 'a',
                } as unknown as GameConfig,
                DEFAULT_GAME_CHANNEL_ID,
            );
            room.requestingPlayers = [player1, player2];
            room.requestingObservers = [observer1, observer2, observer3];
        });

        it('should throw if no user matches', () => {
            expect(() => {
                room.getUserFromRequestingUsers((user) => user.id === 'unknownid');
            }).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if no player matches and is not an observer', () => {
            expect(() => {
                room.getUserFromRequestingUsers((user) => user.id === ID3, false);
            }).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should return the correct player from requesting players with isObserver specified', () => {
            expect(room.getUserFromRequestingUsers((user) => user.id === ID2, false)).to.deep.equal([player2, false]);
        });

        it('should return the correct player from observers players with isObserver specified', () => {
            expect(room.getUserFromRequestingUsers((user) => user.id === ID3, true)).to.deep.equal([observer1, true]);
        });

        it('should return the correct player from observers players without isObserver specified', () => {
            expect(room.getUserFromRequestingUsers((user) => user.id === ID3)).to.deep.equal([observer1, true]);
        });
    });

    describe('removeRequesting', () => {
        let room: WaitingRoom;
        let player1: Player;
        let player2: Player;
        let observer1: Observer;
        let observer2: Observer;
        let observer3: Observer;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            player2 = new Player(ID2, USER2);
            observer1 = { id: ID3, publicUser: USER3 };
            observer2 = { id: ID4, publicUser: USER4 };
            observer3 = { id: ID2, publicUser: USER2 };
            room = new WaitingRoom(
                {
                    player1,
                    maxRoundTime: 60,
                    gameVisibility: GameVisibility.Private,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    password: 'a',
                } as unknown as GameConfig,
                DEFAULT_GAME_CHANNEL_ID,
            );
            room.requestingPlayers = [player2, player1];
            room.requestingObservers = [observer1, observer2, observer3];
        });

        it('should remove player from requestingplayer', () => {
            const requestingPlayersLength = room.requestingPlayers.length;
            room.removeRequesting(player1.id);
            expect(room.requestingPlayers.length).to.equal(requestingPlayersLength - 1);
            expect(room.requestingPlayers.includes(player1)).to.be.false;
        });

        it('should remove observer from requestingObservers', () => {
            const requestingObserversLength = room.requestingObservers.length;
            expect(room.removeRequesting(observer2.id)).to.equal(observer2);
            expect(room.requestingObservers.length).to.equal(requestingObserversLength - 1);
            expect(room.requestingObservers.includes(observer2)).to.be.false;
        });
    });

    describe('changeRequestingToJoined', () => {
        let room: WaitingRoom;
        let player1: Player;
        let player2: Player;
        let observer1: Observer;
        let observer2: Observer;
        let observer3: Observer;

        beforeEach(() => {
            player1 = new Player(ID, USER1);
            player2 = new Player(ID2, USER2);
            observer1 = { id: ID3, publicUser: USER3 };
            observer2 = { id: ID4, publicUser: USER4 };
            observer3 = { id: ID2, publicUser: USER2 };
            room = new WaitingRoom(
                {
                    player1,
                    maxRoundTime: 60,
                    gameVisibility: GameVisibility.Private,
                    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
                    password: 'a',
                } as unknown as GameConfig,
                DEFAULT_GAME_CHANNEL_ID,
            );
            room.requestingPlayers = [player1, player2];
            room.requestingObservers = [observer1, observer2, observer3];
        });

        it('should throw if incoherent', () => {
            expect(() => {
                room.changeRequestingToJoined(observer2.id, false);
            }).to.throw(INVALID_TYPES);
        });

        it('should add to joined observers if observer', () => {
            room.changeRequestingToJoined(observer1.id, true);
            expect(room.joinedObservers.length).to.equal(1);
            expect(room.joinedObservers.includes(observer1)).to.true;
        });

        it('should call to fillNextEmpty if player', () => {
            const spy = chai.spy.on(room, 'fillNextEmptySpot', () => {});

            room.changeRequestingToJoined(player1.id, false);
            expect(spy).to.have.been.called();
        });
    });
});
