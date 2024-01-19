// import { Injectable } from '@angular/core';
// import { StartGameData } from '@app/classes/communication/game-config';
// import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
// import { ObjectiveData } from '@app/classes/communication/objective-data';
// import { ObjectiveState } from '@app/classes/objectives/objective-state';
// import { IResetServiceData } from '@app/utils/i-reset-service-data/i-reset-service-data';

// @Injectable({
//     providedIn: 'root',
// })
// export class ObjectivesManagerService implements IResetServiceData {
//     private objectives?: GameObjectivesData;
//     private isLocalPlayerPlayer1: boolean = false;

//     initialize(startGameData: StartGameData, isLocalPlayerPlayer1: boolean): void {
//         // this.objectives = {
//         //     player1Objectives: startGameData.player1.objectives,
//         //     player2Objectives: startGameData.player2.objectives,
//         // };
//         this.isLocalPlayerPlayer1 = isLocalPlayerPlayer1;
//     }

//     updateObjectives(objectives: GameObjectivesData): void {
//         this.objectives = objectives;
//     }

//     getPublicObjectives(): ObjectiveData[] {
//         return this.getObjectives(this.isLocalPlayerPlayer1).filter((objective) => objective.isPublic);
//     }

//     getPrivateObjectives(): ObjectiveData[] {
//         return this.getObjectives(this.isLocalPlayerPlayer1)
//             .filter((objective) => !objective.isPublic)
//             .concat(this.getOpponentPrivateObjectiveIfCompleted());
//     }

//     resetServiceData(): void {
//         this.objectives = undefined;
//     }

//     private getObjectives(requestingPlayerIsPlayer1: boolean): ObjectiveData[] {
//         return (requestingPlayerIsPlayer1 ? this.objectives?.player1Objectives : this.objectives?.player2Objectives) || [];
//     }

//     private getOpponentPrivateObjectiveIfCompleted(): ObjectiveData[] {
//         const opponentPrivateObjectives: ObjectiveData[] = this.getObjectives(!this.isLocalPlayerPlayer1).filter((objective: ObjectiveData) =>
//             this.isPrivateObjectiveCompletedByOpponent(objective),
//         );
//         opponentPrivateObjectives.forEach((objective: ObjectiveData) => (objective.state = ObjectiveState.CompletedByOpponent));
//         return opponentPrivateObjectives;
//     }

//     private isPrivateObjectiveCompletedByOpponent(objective: ObjectiveData): boolean {
//         return !objective.isPublic && objective.state !== ObjectiveState.NotCompleted;
//     }
// }
