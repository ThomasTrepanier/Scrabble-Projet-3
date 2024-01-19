import { ObjectiveData } from '@app/classes/communication/objective-data';
import { ObjectiveState } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';

export abstract class AbstractObjective {
    progress: number = 0;
    state: ObjectiveState = ObjectiveState.NotCompleted;
    isPublic: boolean = false;

    constructor(
        public name: string,
        public description: string,
        public bonusPoints: number,
        readonly shouldResetOnInvalidWord: boolean,
        protected readonly maxProgress: number,
    ) {}

    isCompleted(): boolean {
        return this.state !== ObjectiveState.NotCompleted;
    }

    convertToData(): ObjectiveData {
        return {
            name: this.name,
            description: this.description,
            bonusPoints: this.bonusPoints,
            state: this.state,
            isPublic: this.isPublic,
            progress: this.progress,
            maxProgress: this.maxProgress,
        };
    }

    updateObjective(validationParameters: ObjectiveValidationParameters): boolean {
        if (this.isCompleted()) return false;

        this.updateProgress(validationParameters);

        if (this.progress >= this.maxProgress) this.state = ObjectiveState.Completed;
        return true;
    }

    abstract updateProgress(validationParameters: ObjectiveValidationParameters): void;
    abstract clone(): AbstractObjective;
}
