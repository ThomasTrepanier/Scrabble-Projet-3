// /* eslint-disable @typescript-eslint/no-magic-numbers */
// import { ObjectiveData } from '@app/classes/communication/objective-data';
// import { ObjectiveState } from '@app/classes/objectives/objective-state';
// import { OPPONENT_COMPLETED_THIS_OBJECTIVE, YOU_COMPLETED_THIS_OBJECTIVE } from '@app/constants/components-constants';
// import { ObjectiveComponent } from './objective.component';

// const DEFAULT_OBJECTIVE: ObjectiveData = {
//     name: '',
//     description: '',
//     state: ObjectiveState.NotCompleted,
//     progress: 0,
//     maxProgress: 0,
//     isPublic: false,
//     bonusPoints: 0,
// };

// describe('ObjectiveComponent', () => {
//     let component: ObjectiveComponent;

//     beforeEach(async () => {
//         component = new ObjectiveComponent();
//         component.objective = { ...DEFAULT_OBJECTIVE };
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('getProgress', () => {
//         const tests: [progress: number, max: number, expected: number][] = [
//             [1, 1, 100],
//             [1, 2, 50],
//             [2, 4, 50],
//             [2, 8, 25],
//         ];

//         for (const [progress, max, expected] of tests) {
//             it(`should convert ${progress}/${max} to ${expected}`, () => {
//                 component.objective.progress = progress;
//                 component.objective.maxProgress = max;

//                 expect(component.getProgress()).toEqual(expected);
//             });
//         }
//     });

//     describe('getStateMessage', () => {
//         const tests: [state: ObjectiveState, expected: string][] = [
//             [ObjectiveState.Completed, YOU_COMPLETED_THIS_OBJECTIVE],
//             [ObjectiveState.CompletedByOpponent, OPPONENT_COMPLETED_THIS_OBJECTIVE(DEFAULT_OBJECTIVE.isPublic)],
//             [ObjectiveState.NotCompleted, ''],
//         ];

//         for (const [state, expected] of tests) {
//             it(`should return message for state ${state}`, () => {
//                 component.objective.state = state;

//                 expect(component.getStateMessage()).toEqual(expected);
//             });
//         }
//     });
// });
