import { removeAccents } from './remove-accents';

describe('WordsVerificationService', () => {
    it('removeAccents should remove all accents', () => {
        expect(removeAccents('ŠšŽžÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìiíiîiïiñòóôõöùúûýÿ')).toBe(
            'SsZzAAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiiiiiinooooouuuyy',
        );
    });
});
