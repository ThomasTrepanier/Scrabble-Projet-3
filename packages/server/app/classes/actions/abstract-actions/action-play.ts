import Action from './action';

export default abstract class ActionPlay extends Action {
    willEndTurn(): boolean {
        return true;
    }
}
