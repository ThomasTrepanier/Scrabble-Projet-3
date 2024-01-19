import { ObjectiveState } from '@app/classes/objectives/objective-utils';

export interface GameObjectivesData {
    player1Objectives?: ObjectiveData[];
    player2Objectives?: ObjectiveData[];
}

export interface ObjectiveData {
    name: string;
    description: string;
    bonusPoints: number;
    state: ObjectiveState;
    isPublic: boolean;
    progress: number;
    maxProgress: number;
}
