import { AbstractWordFinding, ScoredWordPlacement } from '@app/classes/word-finding';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';

// This word finding class search for the easiest bingo to make.

export default class WordFindingPuzzle extends AbstractWordFinding {
    easiestWordPlacement: ScoredWordPlacement | undefined;

    getRequiredTilesToPlace() {
        return MAX_TILES_PER_PLAYER;
    }

    protected handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        if (wordPlacement.tilesToPlace.length === this.getRequiredTilesToPlace()) {
            this.wordPlacements.push(wordPlacement);

            if (!this.easiestWordPlacement || this.easiestWordPlacement.score > wordPlacement.score) {
                this.easiestWordPlacement = wordPlacement;
            }
        }
    }

    protected isSearchCompleted(): boolean {
        return false;
    }
}
