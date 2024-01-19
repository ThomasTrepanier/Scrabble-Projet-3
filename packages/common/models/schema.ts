import { OmitRecursive } from '../types/omit-recursive';

export type NoId<T, AdditionalIds extends string = ''> = OmitRecursive<T, `id${string}` | AdditionalIds>;
