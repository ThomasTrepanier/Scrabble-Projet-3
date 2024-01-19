import { Orientation } from '@app/classes/board';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';

export const NAME = 'Entêtement';
export const DESCRIPTION = "Faire des placements dans la même orientation 5 fois d'affilée";
export const BONUS_POINTS = 70;
export const SHOULD_RESET = true;
export const MAX_PROGRESS = 5;

export class ConsecutivePlaceOrientationObjective extends AbstractObjective {
    progressOrientation: Orientation;
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, MAX_PROGRESS);
        this.progressOrientation = Orientation.Horizontal;
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        if (this.progressOrientation === validationParameters.wordPlacement.orientation) this.progress++;
        else {
            this.progress = 1;
            this.progressOrientation = validationParameters.wordPlacement.orientation;
        }
    }
    clone(): AbstractObjective {
        const clone = new ConsecutivePlaceOrientationObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        clone.progressOrientation = this.progressOrientation;
        return clone;
    }
}
