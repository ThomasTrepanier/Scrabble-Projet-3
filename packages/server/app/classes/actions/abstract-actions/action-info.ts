import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Action from './action';

export default abstract class ActionInfo extends Action {
    execute(): void | GameUpdateData {
        return;
    }

    willEndTurn(): boolean {
        return false;
    }
}
