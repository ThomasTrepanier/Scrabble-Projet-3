import { AbstractWordFinding, ScoredWordPlacement } from '@app/classes/word-finding';

export default class WordFindingExpert extends AbstractWordFinding {
    protected handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        if (this.wordPlacements.length === 0 || this.wordPlacements[0].score < wordPlacement.score) {
            this.wordPlacements = [wordPlacement];
        }
    }

    protected isSearchCompleted(): boolean {
        return false;
    }
}
