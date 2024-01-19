import { OmitRecursive } from './omit-recursive';

export type NoId<T, AdditionalIds extends string = ''> = OmitRecursive<T, `id${string}` | AdditionalIds>;

export type WithIdOf<T> = { [K in keyof T as K extends `id${string}` ? K : never]: T[K] };

export type IdOf<T> = keyof WithIdOf<T>;

export type TypeOfId<T> = T extends { [K in keyof T as K extends `id${string}` ? K : never]: infer I } ? I : never;
