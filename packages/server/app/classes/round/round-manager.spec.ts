/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Action, ActionPass, ActionPlace } from '@app/classes/actions';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { INVALID_PLAYER_TO_REPLACE, NO_FIRST_ROUND_EXISTS } from '@app/constants/services-errors';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { CompletedRound, Round } from './round';
import RoundManager from './round-manager';
import { Board } from '@app/classes/board';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const MAX_TRIES = 100;
const DEFAULT_MAX_ROUND_TIME = 1;
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };
const USER5 = { username: 'user5', email: 'email5', avatar: 'avatar5' };

const DEFAULT_PLAYER_1 = new Player('player-1', USER1);
const DEFAULT_PLAYER_2 = new Player('player-2', USER2);
const DEFAULT_PLAYER_3 = new Player('player-3', USER3);
const DEFAULT_PLAYER_4 = new Player('player-4', USER4);
const VIRTUAL_PLAYER_1 = new BeginnerVirtualPlayer('player-5', 'Player 5');
const NEW_PLAYER = { id: 'newplayer-1', publicUser: USER5 };

describe('RoundManager', () => {
    let roundManager: RoundManager;
    let actionStub: SinonStubbedInstance<Action>;
    let action: Action;
    let gameStub: SinonStubbedInstance<Game>;

    beforeEach(() => {
        roundManager = new RoundManager(DEFAULT_MAX_ROUND_TIME, DEFAULT_PLAYER_1, DEFAULT_PLAYER_2, DEFAULT_PLAYER_3, DEFAULT_PLAYER_4);
        actionStub = createStubInstance(ActionPass);
        action = actionStub as unknown as Action;
        gameStub = createStubInstance(Game);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('should create', () => {
        expect(roundManager).to.exist;
    });

    describe('getNextPlayer', () => {
        it('should return random player at first round', () => {
            const firstPlayer = roundManager['getNextPlayer']();
            let nextPlayer: Player;
            let i = 0;

            do {
                nextPlayer = roundManager['getNextPlayer']();
                i++;
            } while (nextPlayer === firstPlayer && i < MAX_TRIES);

            expect(nextPlayer).to.not.equal(firstPlayer);
        });

        it('should return the other player if not first round (player 1)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_1,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_2);
        });

        it('should return the other player if not first round (player 2)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_2,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_3);
        });

        it('should return the other player if not first round (player 3)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_3,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_4);
        });

        it('should return the other player if not first round (player 4)', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_4,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };

            const player = roundManager['getNextPlayer']();

            expect(player).to.equal(DEFAULT_PLAYER_1);
        });
    });

    describe('nextRound', () => {
        it('should call getNextPlayer', () => {
            const spy = chai.spy.on(roundManager, 'getNextPlayer', () => DEFAULT_PLAYER_1);
            roundManager.nextRound(action, { grid: [[]] } as unknown as Board);
            expect(spy).to.have.been.called();
        });

        it('should add currentRound to completedRounds', () => {
            roundManager['currentRound'] = {
                player: DEFAULT_PLAYER_1,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };
            const spy = chai.spy.on(roundManager['completedRounds'], 'push');
            roundManager.nextRound(action, { grid: [[]] } as unknown as Board);

            expect(spy).to.have.been.called();
        });
    });

    describe('getGameStartTime', () => {
        const DATE_1 = new Date();
        const DATE_2 = new Date();
        const DEFAULT_COMPLETED_ROUND: CompletedRound = {
            player: DEFAULT_PLAYER_1,
            startTime: DATE_2,
            completedTime: new Date(),
        } as CompletedRound;

        beforeEach(() => {
            roundManager['currentRound'] = { startTime: DATE_1 } as unknown as Round;
            roundManager['completedRounds'] = [DEFAULT_COMPLETED_ROUND];
        });

        it('should return startTime of current round if no completedRounds yet', () => {
            roundManager['completedRounds'] = [];
            expect(roundManager.getGameStartTime()).to.equal(DATE_1);
        });

        it('should return startTime of first completed round if it exists', () => {
            expect(roundManager.getGameStartTime()).to.equal(DATE_2);
        });

        it('should throw if no completed rounds and no current round', () => {
            roundManager['completedRounds'] = [];
            roundManager['currentRound'] = undefined as unknown as Round;
            expect(() => roundManager.getGameStartTime()).to.throw(NO_FIRST_ROUND_EXISTS);
        });
    });

    describe('getMaxRoundTime', () => {
        it('should return maxRoundTime', () => {
            const expected = 8008135;
            roundManager['maxRoundTime'] = expected;
            expect(roundManager.getMaxRoundTime()).to.equal(expected);
        });
    });

    describe('saveCompletedRound', () => {
        it('should increment counter when action played is ActionPass', () => {
            expect(roundManager['completedRounds'].length).to.equal(0);
            const round: Round = { player: DEFAULT_PLAYER_1, startTime: new Date(), limitTime: new Date(), tiles: [], board: {} as unknown as Board };
            const actionPlayed: Action = new ActionPass(round.player, gameStub as unknown as Game);
            roundManager['saveCompletedRound'](round, actionPlayed);
            expect(roundManager['completedRounds'].length).to.equal(1);
        });
    });

    describe('convertRoundToRoundData', () => {
        it('should convert player to playerData', () => {
            const player = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.publicUser);
            player.score = 10;
            player.tiles = [];
            const round: Round = {
                player,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };
            const roundData = roundManager.convertRoundToRoundData(round);

            expect(roundData.playerData.publicUser).to.equal(player.publicUser);
            expect(roundData.playerData.id).to.equal(player.id);
            expect(roundData.playerData.score).to.equal(player.score);
            expect(roundData.playerData.tiles).to.equal(player.tiles);
            expect(roundData.startTime).to.equal(round.startTime);
            expect(roundData.limitTime).to.equal(round.limitTime);
        });
    });

    it('getCurrentRound should return the current currentRound', () => {
        const CURRENT_ROUND = {
            player: DEFAULT_PLAYER_1,
            startTime: new Date(),
            limitTime: new Date(),
            completedTime: null,
            tiles: [],
            board: {} as unknown as Board,
        };
        roundManager['currentRound'] = CURRENT_ROUND;
        roundManager.getCurrentRound();
        expect(roundManager.getCurrentRound()).to.deep.equal(CURRENT_ROUND);
    });

    describe('replacePlayer', () => {
        let player1: Player;
        let player2: Player;
        let player3: Player;
        let player4: Player;
        let newPlayer: Player;
        beforeEach(() => {
            player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.publicUser);
            player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.publicUser);
            player3 = new Player(DEFAULT_PLAYER_3.id, DEFAULT_PLAYER_3.publicUser);
            player4 = new Player(DEFAULT_PLAYER_4.id, DEFAULT_PLAYER_4.publicUser);
            newPlayer = new Player(NEW_PLAYER.id, NEW_PLAYER.publicUser);

            const round: Round = {
                player: player1,
                startTime: new Date(),
                limitTime: new Date(),
                tiles: [],
                board: {} as unknown as Board,
            };
            roundManager['currentRound'] = round;
            roundManager['player1'] = player1;
            roundManager['player2'] = player2;
            roundManager['player3'] = player3;
            roundManager['player4'] = player4;
        });

        it('should replace the player in the current round', () => {
            roundManager.replacePlayer(DEFAULT_PLAYER_1.id, newPlayer);
            expect(roundManager['currentRound'].player).to.equal(newPlayer);
        });

        it('should replace the correct player (player1) in the round manager', () => {
            roundManager.replacePlayer(DEFAULT_PLAYER_1.id, newPlayer);
            expect(roundManager['player1']).to.equal(newPlayer);
        });

        it('should replace the correct player (player2) in the round manager', () => {
            roundManager.replacePlayer(DEFAULT_PLAYER_2.id, newPlayer);
            expect(roundManager['player2']).to.equal(newPlayer);
        });

        it('should replace the correct player (player4) in the round manager', () => {
            roundManager.replacePlayer(DEFAULT_PLAYER_3.id, newPlayer);
            expect(roundManager['player3']).to.equal(newPlayer);
        });

        it('should replace the correct player (player4) in the round manager', () => {
            roundManager.replacePlayer(DEFAULT_PLAYER_4.id, newPlayer);
            expect(roundManager['player4']).to.equal(newPlayer);
        });

        it('should throw if it is an invalid id', () => {
            const result = () => {
                roundManager.replacePlayer('badId', newPlayer);
            };
            expect(result).to.throw(INVALID_PLAYER_TO_REPLACE);
        });
    });

    describe('verifyIfGameOver', () => {
        const PASS_PLAYER1_ROUND: CompletedRound = {
            player: DEFAULT_PLAYER_1,
            actionPlayed: new ActionPass(DEFAULT_PLAYER_1, {} as unknown as Game),
        } as unknown as CompletedRound;
        const PLAY_PLAYER1_ROUND: CompletedRound = {
            player: DEFAULT_PLAYER_1,
            actionPlayed: {} as unknown as ActionPlace,
        } as unknown as CompletedRound;
        const PLAY_VIRTUAL1_ROUND: CompletedRound = {
            player: VIRTUAL_PLAYER_1,
            actionPlayed: {} as unknown as ActionPlace,
        } as unknown as CompletedRound;

        it('should return false if completedRounds has a length of less that 4', () => {
            roundManager['completedRounds'] = [PASS_PLAYER1_ROUND, PASS_PLAYER1_ROUND, PASS_PLAYER1_ROUND];
            expect(roundManager.verifyIfGameOver()).to.be.false;

            roundManager['completedRounds'] = [PASS_PLAYER1_ROUND, PASS_PLAYER1_ROUND, PASS_PLAYER1_ROUND];
            expect(roundManager.verifyIfGameOver()).to.be.false;
        });

        it('should return false if completedRounds has a real player that played in the last 8 rounds', () => {
            roundManager['completedRounds'] = [
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PLAY_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
            ];
            expect(roundManager.verifyIfGameOver()).to.be.false;
        });

        it('should return true if completedRounds only has a virtual player that played in the last 8 rounds', () => {
            roundManager['completedRounds'] = [
                PLAY_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PLAY_VIRTUAL1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
                PASS_PLAYER1_ROUND,
            ];
            expect(roundManager.verifyIfGameOver()).to.be.true;
        });
    });
});
