/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { GameObjectivesData } from '@app/classes/communication/objective-data';
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveState } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import Player from '@app/classes/player/player';
import { GENERATE_LIST_OF_ALL_OBJECTIVES, NUMBER_OF_OBJECTIVES_IN_GAME } from '@app/constants/services-constants/objective-const';
import { generateTestObjective, TestObjective } from '@app/classes/objectives/objectives-test-helper.spec';
import { INVALID_PLAYER_ID_FOR_GAME, NO_OBJECTIVE_LEFT_IN_POOL } from '@app/constants/services-errors';
import { Random } from '@app/utils/random/random';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { describe } from 'mocha';
import { SinonStub, stub } from 'sinon';
import { Container } from 'typedi';
import ObjectivesService from './objective.service';
chai.use(spies);

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const DEFAULT_PLAYER: Player = new Player('id', USER1);
const DEFAULT_GAME_CHANNEL_ID = 1;
const OPPONENT: Player = new Player('op', USER2);

describe('ObjectiveService', () => {
    let service: ObjectivesService;
    let findOpponentSpy: unknown;
    let player: Player;
    let game: Game;

    beforeEach(() => {
        Container.reset();
    });

    beforeEach(() => {
        service = Container.get(ObjectivesService);
        findOpponentSpy = chai.spy.on(service, 'findOpponent', () => OPPONENT);
        player = DEFAULT_PLAYER;
        game = new Game(DEFAULT_GAME_CHANNEL_ID);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('createObjectivesForGame', () => {
        let objectives: AbstractObjective[];
        let createSpy: unknown;
        let randomPopSpy: unknown;

        beforeEach(() => {
            objectives = [generateTestObjective(1), generateTestObjective(2), generateTestObjective(3), generateTestObjective(4)];
            createSpy = chai.spy.on(service, 'createObjectivesPool', () => objectives);
            randomPopSpy = chai.spy.on(service, 'popObjectiveFromPool', () => objectives.pop());
        });

        it('should call createObjectivesPool', async () => {
            service.createObjectivesForGame();
            expect(createSpy).to.have.been.called();
        });

        it('should call popObjectiveFromPool', async () => {
            service.createObjectivesForGame();
            expect(randomPopSpy).to.have.been.called.with(objectives);
        });
    });

    describe('validatePlayerObjectives', () => {
        let validationParameters: ObjectiveValidationParameters;
        let objectiveUpdateStubs: unknown[];
        let objectiveCompleteStubs: SinonStub[];
        let addToUpdateSpy: unknown;
        let handleCompleteSpy: unknown;
        let objectives: AbstractObjective[];

        beforeEach(() => {
            objectives = [generateTestObjective(1)];
            chai.spy.on(player, 'getObjectives', () => objectives);
            validationParameters = {
                game: game as unknown as Game,
            } as unknown as ObjectiveValidationParameters;
            objectiveUpdateStubs = objectives.map((o: AbstractObjective) => stub(o, 'updateObjective').returns(true));
            objectiveCompleteStubs = objectives.map((o: AbstractObjective) => stub(o, 'isCompleted').returns(false));
            addToUpdateSpy = chai.spy.on(service, 'addPlayerObjectivesToUpdateData', () => {
                return {};
            });
            handleCompleteSpy = chai.spy.on(service, 'handleObjectiveCompletion', () => {});
        });

        afterEach(() => {
            objectiveUpdateStubs.forEach((s: SinonStub) => s.restore());
            objectiveCompleteStubs.forEach((s: SinonStub) => s.restore());
        });

        it('should call updateObjective on each objective of player', () => {
            service.validatePlayerObjectives(player, game, validationParameters);
            objectiveUpdateStubs.forEach((s: SinonStub) => expect(s.calledWith(validationParameters)).to.be.true);
        });

        it('should not call handleObjectiveCompletion if objective is already completed', () => {
            objectiveUpdateStubs.forEach((s: SinonStub) => s.returns(false));
            objectiveCompleteStubs.forEach((s: SinonStub) => s.returns(true));

            service.validatePlayerObjectives(player, game, validationParameters);
            objectives.forEach(() => {
                expect(handleCompleteSpy).not.to.have.been.called();
            });
        });
        it('should call handleObjectiveCompletion if objective is completed by update', () => {
            objectiveCompleteStubs.forEach((s: SinonStub) => s.returns(true));
            service.validatePlayerObjectives(player, game, validationParameters);
            objectives.forEach((o: AbstractObjective) => {
                expect(handleCompleteSpy).to.have.been.called.with(o, player, game);
            });
        });

        it('should call addPlayerObjectivesToUpdateData with player', () => {
            service.validatePlayerObjectives(player, game, validationParameters);
            expect(addToUpdateSpy).to.have.been.called.with(game, player, {});
        });

        it('should call addPlayerObjectivesToUpdateData with Opponent', () => {
            service.validatePlayerObjectives(player, game, validationParameters);
            expect(findOpponentSpy).to.have.been.called.with(game, player);
            expect(addToUpdateSpy).to.have.been.called.with(game, OPPONENT, {});
        });
    });

    it('validatePlayerObjectives should return undefined if no objectives were updated', () => {
        chai.spy.on(player, 'getObjectives', () => []);
        const validationParameters: ObjectiveValidationParameters = {
            game: game as unknown as Game,
        } as unknown as ObjectiveValidationParameters;
        const result = service.validatePlayerObjectives(player, game, validationParameters);
        expect(result).to.be.undefined;
    });

    describe('handleObjectiveCompletion', () => {
        let spy: unknown;

        beforeEach(() => {
            spy = chai.spy.on(service, 'completeOpponentObjective', () => {});
        });

        it('should call completeOpponentObjective if objective is public', () => {
            const objective = new TestObjective('name');
            objective.isPublic = true;
            service['handleObjectiveCompletion'](objective, player, game);
            expect(spy).to.have.been.called.with(OPPONENT, objective);
        });

        it('should NOT call completeOpponentObjective if objective is private', () => {
            const objective = new TestObjective('name');
            objective.isPublic = false;
            service['handleObjectiveCompletion'](objective, player, game);
            expect(spy).not.to.have.been.called();
        });
    });

    describe('completeOpponentObjective', () => {
        let objective: AbstractObjective;

        beforeEach(() => {
            objective = new TestObjective('test');
            objective.isPublic = true;
        });

        it('should set identical objective on opponent to CompletedByOpponent', () => {
            const opponentObjective: AbstractObjective = new TestObjective('test');
            opponentObjective.isPublic = true;
            chai.spy.on(OPPONENT, 'getObjectives', () => [opponentObjective]);
            service['completeOpponentObjective'](OPPONENT, objective);
            expect(opponentObjective.state).to.equal(ObjectiveState.CompletedByOpponent);
        });
    });

    describe('findOpponent', () => {
        beforeEach(() => {
            chai.spy.restore();
            game.player1 = DEFAULT_PLAYER;
        });

        it('should return player with diffrent id from the one provided', () => {
            game.player2 = OPPONENT;
            expect(service['findOpponent'](game, game.player1)).to.equal(OPPONENT);
        });

        it('should throw error if no different player was found', () => {
            game.player2 = DEFAULT_PLAYER;
            expect(() => service['findOpponent'](game, game.player1)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('addPlayerObjectivesToUpdateData', () => {
        let objective: AbstractObjective;

        beforeEach(() => {
            objective = generateTestObjective(1);
            chai.spy.on(player, 'getObjectives', () => [objective]);
        });

        it('should return objective data as player 1 if player 1 is provided', () => {
            const actual: GameObjectivesData = service['addPlayerObjectivesToUpdateData'](game, player, {});
            const expected: GameObjectivesData = { player1Objectives: [objective.convertToData()] };
            expect(actual).to.deep.equal(expected);
        });

        // it('should return objective data as player 2 if player 2 is provided', () => {
        //     const actual: GameObjectivesData = service['addPlayerObjectivesToUpdateData'](game, player, {});
        //     const expected: GameObjectivesData = { player2Objectives: [objective.convertToData()] };
        //     expect(actual).to.deep.equal(expected);
        // });
    });

    it('createObjectivesPool should call getRandomElementsFromArray for 4 elements', async () => {
        const randomSpy = chai.spy.on(Random, 'getRandomElementsFromArray', () => {});
        service['createObjectivesPool']();
        expect(randomSpy).to.have.been.called.with(GENERATE_LIST_OF_ALL_OBJECTIVES(), NUMBER_OF_OBJECTIVES_IN_GAME);
    });

    describe('popObjectiveFromPool', () => {
        it('should return objective if pool is not empty', () => {
            const poppedObjective: AbstractObjective = generateTestObjective(1);
            const objectives: AbstractObjective[] = [poppedObjective];

            const actualObjectives: AbstractObjective = service['popObjectiveFromPool'](objectives);
            const expectedObjectives: AbstractObjective = poppedObjective;

            expect(actualObjectives).to.deep.equal(expectedObjectives);
            expect(objectives.includes(actualObjectives)).to.be.false;
        });

        it('should throw error if pool is empty', () => {
            expect(() => service['popObjectiveFromPool']([])).to.throw(NO_OBJECTIVE_LEFT_IN_POOL);
        });
    });

    describe('resetPlayerObjectiveProgression', () => {
        let resetSpy: unknown;
        let updateSpy: unknown;

        beforeEach(() => {
            resetSpy = chai.spy.on(player, 'resetObjectivesProgression', () => {});
            updateSpy = chai.spy.on(service, 'addPlayerObjectivesToUpdateData', () => undefined as unknown as GameObjectivesData);
        });

        it('should call reset on player', () => {
            service.resetPlayerObjectiveProgression(game, player);
            expect(resetSpy).to.have.been.called();
        });

        it('should add objectives to update', () => {
            service.resetPlayerObjectiveProgression(game, player);
            expect(updateSpy).to.have.been.called.with(game, player, {});
        });
    });
});
