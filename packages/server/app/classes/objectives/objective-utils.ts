import { GameObjectivesData } from '@app/classes/communication/objective-data';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';

export interface GameObjectives {
    readonly publicObjectives: Set<AbstractObjective>;
    readonly player1Objective: AbstractObjective;
    readonly player2Objective: AbstractObjective;
}

export interface ObjectiveUpdate {
    updateData: GameObjectivesData;
    completionMessages: string[];
}

export enum ObjectiveState {
    NotCompleted = 'NotCompleted',
    Completed = 'Completed',
    CompletedByOpponent = 'CompletedByOpponent',
}
