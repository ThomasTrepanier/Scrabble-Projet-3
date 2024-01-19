import { HttpException } from '@app/classes/http-exception/http-exception';
import {
    INVALID_WORD,
    MINIMUM_WORD_LENGTH,
    WORD_CONTAINS_APOSTROPHE,
    WORD_CONTAINS_ASTERISK,
    WORD_CONTAINS_HYPHEN,
    WORD_TOO_SHORT,
} from '@app/constants/services-errors';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class WordsVerificationService {
    constructor(private readonly dictionaryService: DictionaryService) {}

    verifyWords(words: string[], dictionaryId: string): void {
        for (const word of words) {
            const curatedWord = this.removeAccents(word).toLowerCase();

            if (curatedWord.length < MINIMUM_WORD_LENGTH) throw new HttpException(curatedWord + WORD_TOO_SHORT, StatusCodes.FORBIDDEN);
            if (curatedWord.includes('*')) throw new HttpException(curatedWord + WORD_CONTAINS_ASTERISK, StatusCodes.FORBIDDEN);
            if (curatedWord.includes('-')) throw new HttpException(curatedWord + WORD_CONTAINS_HYPHEN, StatusCodes.FORBIDDEN);
            if (curatedWord.includes("'")) throw new HttpException(curatedWord + WORD_CONTAINS_APOSTROPHE, StatusCodes.FORBIDDEN);
            if (!this.dictionaryService.getDictionary(dictionaryId).wordExists(curatedWord))
                throw new HttpException(INVALID_WORD(word.toUpperCase()), StatusCodes.FORBIDDEN);
        }
    }

    private removeAccents(word: string): string {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
