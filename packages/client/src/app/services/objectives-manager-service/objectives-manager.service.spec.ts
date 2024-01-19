// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// import { TestBed } from '@angular/core/testing';
// import { StartGameData } from '@app/classes/communication/game-config';
// import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
// import { ObjectiveData } from '@app/classes/communication/objective-data';
// import { ObjectiveState } from '@app/classes/objectives/objective-state';
// import { ObjectivesManagerService } from './objectives-manager.service';

// const DEFAULT_OBJECTIVE: ObjectiveData = {
//     name: '',
//     description: '',
//     state: ObjectiveState.NotCompleted,
//     progress: 0,
//     maxProgress: 0,
//     isPublic: false,
//     bonusPoints: 0,
// };

// describe('ObjectivesManagerService', () => {
//     let service: ObjectivesManagerService;
//     let player1Objectives: ObjectiveData[];
//     let player2Objectives: ObjectiveData[];

//     beforeEach(() => {
//         TestBed.configureTestingModule({});
//         service = TestBed.inject(ObjectivesManagerService);

//         player1Objectives = [
//             { ...DEFAULT_OBJECTIVE, name: 'player 1 objective' },
//             { ...DEFAULT_OBJECTIVE, isPublic: true },
//         ];
//         player2Objectives = [
//             { ...DEFAULT_OBJECTIVE, name: 'player 2 objective' },
//             { ...DEFAULT_OBJECTIVE, isPublic: true },
//         ];

//         service['objectives'] = { player1Objectives, player2Objectives };
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     describe('initialize', () => {
//         it('should set objectives and isLocalPlayerPlayer1', () => {
//             const startGameData: StartGameData = {
//                 player1: {
//                     objectives: player1Objectives,
//                 },
//                 player2: {
//                     objectives: player2Objectives,
//                 },
//             } as unknown as StartGameData;
//             const isLocalPlayerPlayer1 = true;

//             service.initialize(startGameData, isLocalPlayerPlayer1);

//             expect(service['objectives']?.player1Objectives).toEqual(player1Objectives);
//             expect(service['objectives']?.player2Objectives).toEqual(player2Objectives);
//             expect(service['isLocalPlayerPlayer1']).toEqual(isLocalPlayerPlayer1);
//         });
//     });

//     describe('getPublicObjectives', () => {
//         it('should return all objectives that are public', () => {
//             const allObjectives = service['getObjectives'](true);
//             const publicObjectives = service.getPublicObjectives();

//             expect(allObjectives.some((o) => !o.isPublic)).toBeTrue();
//             expect(publicObjectives.every((o) => o.isPublic)).toBeTrue();
//         });

//         it('should call getObjectives with isLocalPlayerPlayer1', () => {
//             service['isLocalPlayerPlayer1'] = true;
//             const getSpy = spyOn<any>(service, 'getObjectives').and.callFake(() => []);
//             service.getPublicObjectives();

//             expect(getSpy).toHaveBeenCalledWith(service['isLocalPlayerPlayer1']);
//         });
//     });

//     describe('updateObjectives', () => {
//         it('should set objectives', () => {
//             const objectives: GameObjectivesData = {};

//             service.updateObjectives(objectives);

//             expect(service['objectives']).toEqual(objectives);
//         });
//     });

//     describe('resetServiceData', () => {
//         it('should set objectives to undefined', () => {
//             service.resetServiceData();

//             expect(service['objectives']).toBeUndefined();
//         });
//     });

//     describe('getPrivateObjectives', () => {
//         it('should return all objectives that are private', () => {
//             const allObjectives = service['getObjectives'](true);
//             const privateObjectives = service.getPrivateObjectives();

//             expect(allObjectives.some((o) => o.isPublic)).toBeTrue();
//             expect(privateObjectives.every((o) => !o.isPublic)).toBeTrue();
//         });

//         it('should call getObjectives with isLocalPlayerPlayer1', () => {
//             service['isLocalPlayerPlayer1'] = true;
//             const getSpy = spyOn<any>(service, 'getObjectives').and.callFake(() => []);
//             service.getPrivateObjectives();

//             expect(getSpy).toHaveBeenCalledWith(service['isLocalPlayerPlayer1']);
//         });

//         it('should call getOpponentPrivateObjectiveIfCompleted', () => {
//             service['isLocalPlayerPlayer1'] = true;
//             const getSpy = spyOn<any>(service, 'getOpponentPrivateObjectiveIfCompleted').and.callFake(() => []);
//             service.getPrivateObjectives();

//             expect(getSpy).toHaveBeenCalled();
//         });
//     });

//     describe('getObjectives', () => {
//         it('should return player1Objectives if is player 1', () => {
//             const isLocalPlayerPlayer1 = true;

//             expect(service['getObjectives'](isLocalPlayerPlayer1)).toEqual(player1Objectives);
//         });

//         it('should return player1Objectives if is player 2', () => {
//             const isLocalPlayerPlayer1 = false;

//             expect(service['getObjectives'](isLocalPlayerPlayer1)).toEqual(player2Objectives);
//         });

//         it('should return empty array if objectives are undefined (player 1)', () => {
//             const isLocalPlayerPlayer1 = true;
//             service['objectives'] = undefined;

//             expect(service['getObjectives'](isLocalPlayerPlayer1)).toEqual([]);
//         });

//         it('should return empty array if objectives are undefined (player 2)', () => {
//             const isLocalPlayerPlayer1 = false;
//             service['objectives'] = undefined;

//             expect(service['getObjectives'](isLocalPlayerPlayer1)).toEqual([]);
//         });

//         it('should return empty array if player1 objectives are undefined', () => {
//             const isLocalPlayerPlayer1 = true;
//             service['objectives'] = {};

//             expect(service['getObjectives'](isLocalPlayerPlayer1)).toEqual([]);
//         });

//         it('should return empty array if player2 objectives are undefined', () => {
//             const isLocalPlayerPlayer1 = false;
//             service['objectives'] = {};

//             expect(service['getObjectives'](isLocalPlayerPlayer1)).toEqual([]);
//         });
//     });

//     describe('getOpponentPrivateObjectiveIfCompleted', () => {
//         it('should return empty array if opponent has not completed their private objective', () => {
//             service['objectives']?.player2Objectives?.forEach((objective: ObjectiveData) => (objective.state = ObjectiveState.NotCompleted));
//             expect(service['getOpponentPrivateObjectiveIfCompleted']()).toEqual([]);
//         });

//         it('should return opponent private objective with state CompletedByOpponent if it is completed', () => {
//             spyOn<any>(service, 'getObjectives').and.returnValue(service['objectives']?.player2Objectives);
//             service['objectives']!.player2Objectives![0].state = ObjectiveState.Completed;

//             const expectedObjective: ObjectiveData = {
//                 ...service['objectives']!.player2Objectives![0],
//                 state: ObjectiveState.CompletedByOpponent,
//             };
//             expect(service['getOpponentPrivateObjectiveIfCompleted']()).toEqual([expectedObjective]);
//         });
//     });

//     describe('isPrivateObjectiveCompletedByOpponent', () => {
//         it('should return false if opponent has not completed the objective', () => {
//             expect(
//                 service['isPrivateObjectiveCompletedByOpponent']({ state: ObjectiveState.NotCompleted, isPublic: false } as ObjectiveData),
//             ).toBeFalse();
//         });

//         it('should return false if objective is not private', () => {
//             expect(
//                 service['isPrivateObjectiveCompletedByOpponent']({ state: ObjectiveState.Completed, isPublic: true } as ObjectiveData),
//             ).toBeFalse();
//         });

//         it('should return true if objective is private and different from NotCompleted', () => {
//             expect(
//                 service['isPrivateObjectiveCompletedByOpponent']({ state: ObjectiveState.CompletedByOpponent, isPublic: false } as ObjectiveData),
//             ).toBeTrue();
//         });
//     });
// });
