import { CompleteDictionaryData, DictionarySummary } from '@app/classes/communication/dictionary-data';
import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    summary: DictionarySummary;

    constructor(dictionaryData: CompleteDictionaryData) {
        super();
        this.summary = {
            title: dictionaryData.title,
            id: dictionaryData.id,
            description: dictionaryData.description,
            isDefault: dictionaryData.isDefault,
        };
        this.depth = -1;

        for (const word of dictionaryData.words) {
            this.addWord(word);
        }
    }
}
