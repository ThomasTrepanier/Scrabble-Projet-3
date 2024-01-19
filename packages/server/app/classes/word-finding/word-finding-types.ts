import { LetterValue, Tile } from '@app/classes/tile';
import { Board, Orientation, Position } from '@app/classes/board';
import { Dictionary, DictionaryNode } from '@app/classes/dictionary';
import Range from '@app/classes/range/range';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordPlacement as WordPlacementCommon } from '@common/models/word-finding';

export interface WithDistance {
    distance: number;
}
export interface LetterPosition extends WithDistance {
    letter: LetterValue;
}
export interface PerpendicularLettersPosition extends WithDistance {
    before: LetterValue[];
    after: LetterValue[];
}
export interface LinePlacements {
    letters: LetterPosition[];
    perpendicularLetters: PerpendicularLettersPosition[];
}
export interface BoardPlacement {
    letters: LetterPosition[];
    perpendicularLetters: PerpendicularLettersPosition[];
    position: Position;
    orientation: Orientation;
    maxSize: number;
    minSize: number;
}

export interface DictionarySearcherStackItem {
    node: DictionaryNode;
    playerLetters: string[];
}

export interface SearcherPerpendicularLetters extends WithDistance {
    before: string;
    after: string;
}

export interface PerpendicularWord extends WithDistance {
    word: string;
    junctionDistance: number;
}

export interface DictionarySearchResult {
    word: string;
    perpendicularWords: PerpendicularWord[];
}

export interface WordFindingRequest {
    useCase: WordFindingUseCase;
    pointRange?: Range;
    pointHistory?: Map<number, number>;
}

export enum WordFindingUseCase {
    Expert,
    Beginner,
    Hint,
    Puzzle,
}

export interface WordPlacement extends WordPlacementCommon {
    startPosition: Position;
}

export interface ScoredWordPlacement extends WordPlacement {
    score: number;
}

export type PartialWordFindingParameters = [Board, Tile[], WordFindingRequest];

export type WordFindingParameters = [Board, Tile[], WordFindingRequest, Dictionary, ScoreCalculatorService];
