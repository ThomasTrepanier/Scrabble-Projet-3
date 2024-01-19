export const arrayDeepCopy = <T>(originalArray: T[]): T[] => {
    return originalArray.map((e) => ({ ...e }));
};
