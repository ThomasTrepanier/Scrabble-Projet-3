/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { GameObjectives } from '@app/classes/objectives/objective-utils';
import { generateGameObjectives, generateResetableTestObjective, generateTestObjective } from '@app/classes/objectives/objectives-test-helper.spec';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from 'app/classes/tile';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { assert } from 'console';
import * as sinon from 'sinon';
import { stub } from 'sinon';
import Player from './player';
chai.use(spies);

const ID = 'id';
const DEFAULT_GAME_CHANNEL_ID = 1;
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(ID, USER1);
        player.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'B' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'D' },
        ];
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(player).to.exist;
    });

    it('getTileRackPoints should return the sum of tile values', () => {
        const expected = 11;
        expect(player.getTileRackPoints()).to.equal(expected);
    });

    it('hasTilesLeft should true if there are tiles left', () => {
        const expected = true;
        expect(player.hasTilesLeft()).to.equal(expected);
    });

    it('hasTilesLeft should false if there are tiles left', () => {
        player.tiles = [];
        const expected = false;
        expect(player.hasTilesLeft()).to.equal(expected);
    });

    it('endGameMessage should call tilesToString and return the correct message', () => {
        const tilesToStringStub = stub(player, 'tilesToString' as any).returns('aaaa');
        expect(player.endGameMessage()).to.equal(`${player.publicUser.username} : aaaa`);
        assert(tilesToStringStub.calledOnce);
    });

    it('tilesToString should return the string of the tiles', () => {
        expect(player['tilesToString']()).to.equal('abad');
    });

    it('getObjectives should return player objectives as array', () => {
        player['objectives'] = [generateTestObjective(1)];
        const expected: AbstractObjective[] = player['objectives'];
        const actual: AbstractObjective[] = player.getObjectives();
        expect(actual).to.deep.equal(expected);
    });

    it('initializeObjectives should set player objectives', async () => {
        const objectives: GameObjectives = generateGameObjectives();
        player['objectives'] = undefined as unknown as AbstractObjective[];
        player.initializeObjectives(objectives.publicObjectives, objectives.player1Objective);
        expect(player['objectives']).to.deep.equal([...objectives.publicObjectives, objectives.player1Objective]);
    });

    describe('resetObjectivesProgression', () => {
        const initialProgress = 1;
        let objective: AbstractObjective;

        beforeEach(() => {
            objective = generateResetableTestObjective(1);

            player['objectives'] = [objective];
            objective.progress = initialProgress;
        });

        it('should not reset objective if it is completed', () => {
            chai.spy.on(objective, 'isCompleted', () => true);

            player.resetObjectivesProgression();

            expect(objective.progress).to.equal(initialProgress);
        });

        it('should not reset objective if it is not resetable', () => {
            objective = generateTestObjective(1);
            player['objectives'] = [objective];
            objective.progress = initialProgress;

            chai.spy.on(objective, 'isCompleted', () => false);
            expect(objective.shouldResetOnInvalidWord).to.be.false;

            player.resetObjectivesProgression();
            expect(objective.progress).to.equal(initialProgress);
        });

        it('should reset objective if conditions are met', () => {
            chai.spy.on(objective, 'isCompleted', () => false);
            expect(objective.shouldResetOnInvalidWord).to.be.true;

            player.resetObjectivesProgression();

            expect(objective.progress).to.equal(0);
        });
    });

    it('validateObjectives should call objective service to validate objectives', async () => {
        const serviceSpy = chai.spy.on(player['objectiveService'], 'validatePlayerObjectives', () => {});
        const validationParameters: ObjectiveValidationParameters = {
            game: new Game(DEFAULT_GAME_CHANNEL_ID),
        } as unknown as ObjectiveValidationParameters;
        player.validateObjectives(validationParameters);
        expect(serviceSpy).to.have.been.called.with(player, validationParameters.game, validationParameters);
    });

    it('copyPlayerInfo should update the player data', () => {
        const id = 'nikolajID';
        const otherPlayer = new Player(id, USER2);
        otherPlayer['objectives'] = [{} as unknown as AbstractObjective];
        otherPlayer.score = 3;
        otherPlayer.tiles = [{} as unknown as Tile];
        expect(player.copyPlayerInfo(otherPlayer)).to.deep.equal({ id: otherPlayer.id, newId: player.id, publicUser: player.publicUser });
        expect(player.score).to.equal(otherPlayer.score);
        expect(player.tiles).to.equal(otherPlayer.tiles);
        expect(player['objectives']).to.equal(otherPlayer['objectives']);
    });

    it('convertToPlayerData should return PlayerData with exact info from instance', () => {
        player.score = 42069;
        player.isConnected = true;
        const convertResult: PlayerData = player.convertToPlayerData();

        expect(convertResult.id).to.equal(player.id);
        expect(convertResult.publicUser).to.equal(player.publicUser);
        expect(convertResult.score).to.equal(player.score);
        expect(convertResult.tiles).to.equal(player.tiles);
        expect(convertResult.isConnected).to.equal(player.isConnected);
    });
});
