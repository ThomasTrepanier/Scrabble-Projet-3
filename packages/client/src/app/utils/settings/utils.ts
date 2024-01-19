export const capitalize = <T extends string>(str: T): Capitalize<T> => (str.substring(0, 1).toUpperCase() + str.substring(1)) as Capitalize<T>;
export const toGetter = <T extends string>(str: T): `get${Capitalize<T>}` => `get${capitalize(str)}`;
export const toSetter = <T extends string>(str: T): `set${Capitalize<T>}` => `set${capitalize(str)}`;

export const parseBool = (v: unknown): boolean | undefined => {
    if (v === true || v === 1 || v === '1' || v === 'true' || v === 't' || v === 'yes' || v === 'y') return true;
    if (v === false || v === 0 || v === '0' || v === 'false' || v === 'f' || v === 'no' || v === 'n') return false;
    return undefined;
};
