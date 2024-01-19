import { PuzzleGenerator } from '@app/classes/puzzle/puzzle-generator/puzzle-generator';
import { PuzzleGeneratorParameters } from '@app/classes/puzzle/puzzle-generator/puzzle-generator-parameters';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { MAX_WORD_COUNT, MAX_WORD_SIZE, MIN_WORD_COUNT, MIN_WORD_SIZE, SKIP_PLACEMENT_DISTANCE_CUTOFF } from '@app/constants/puzzle-constants';
import * as seedrandom from 'seedrandom';

export class DailyPuzzleGenerator extends PuzzleGenerator {
    private seed: string;
    constructor({
        minWordCount = MIN_WORD_COUNT,
        maxWordCount = MAX_WORD_COUNT,
        minWordSize = MIN_WORD_SIZE,
        maxWordSize = MAX_WORD_SIZE,
        skipPlacementDistanceCutoff = SKIP_PLACEMENT_DISTANCE_CUTOFF,
        bingoWordSize = MAX_TILES_PER_PLAYER,
    }: Partial<PuzzleGeneratorParameters> = {}) {
        super({ minWordCount, maxWordCount, minWordSize, maxWordSize, bingoWordSize, skipPlacementDistanceCutoff });
        this.seed = this.getDefaultSeed();
        this.random = seedrandom(this.seed);
    }

    nextSeed(): void {
        this.seed = this.seed + 'x';
        this.random = seedrandom(this.seed);
    }

    private getDefaultSeed(): string {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
}
