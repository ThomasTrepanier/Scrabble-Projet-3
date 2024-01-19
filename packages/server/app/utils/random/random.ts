import * as seedrandom from 'seedrandom';

export class Random {
    static getRandomElementsFromArray<T>(array: T[], elementsToChoose: number = 1, random = seedrandom()): T[] {
        if (elementsToChoose > array.length) return array;

        let length = array.length;
        const result = new Array(elementsToChoose);
        const taken = new Array(length);

        while (elementsToChoose--) {
            const randomIndex = Math.floor(random() * length);

            result[elementsToChoose] = array[randomIndex in taken ? taken[randomIndex] : randomIndex];
            taken[randomIndex] = --length in taken ? taken[length] : length;
        }
        return result;
    }

    static popRandom<T>(array: T[], random = seedrandom()): T | undefined {
        return array.splice(Math.floor(random() * array.length), 1).pop();
    }

    static randomIntFromInterval(min: number, max: number, random = seedrandom()): number {
        return Math.floor(random() * (max - min + 1) + min);
    }

    static shuffle<T>(array: T[], random = seedrandom()): T[] {
        let currentIndex = array.length;
        let randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}
