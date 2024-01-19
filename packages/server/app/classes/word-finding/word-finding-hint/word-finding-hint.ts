import { HINT_ACTION_NUMBER_OF_WORDS } from '@app/constants/classes-constants';
import { AbstractWordFinding, ScoredWordPlacement } from '@app/classes/word-finding';

export default class WordFindingHint extends AbstractWordFinding {
    protected handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        if (
            this.wordPlacements.length < HINT_ACTION_NUMBER_OF_WORDS ||
            this.wordPlacements[this.wordPlacements.length - 1].score < wordPlacement.score
        ) {
            if (this.wordPlacements.length === HINT_ACTION_NUMBER_OF_WORDS) this.wordPlacements.pop();
            this.wordPlacements.push(wordPlacement);
            this.wordPlacements.sort((a, b) => b.score - a.score);
        }
    }

    protected isSearchCompleted(): boolean {
        return false;
    }
}
