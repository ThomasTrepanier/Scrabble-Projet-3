import { TryArrayElement } from './array-element';

// eslint-disable-next-line @typescript-eslint/ban-types
export type OmitRecursive<T, O extends string, DefaultType = object> = T extends DefaultType
    ? T extends Date
        ? T
        : Omit<
              {
                  [K in keyof T]: T[K] extends unknown[]
                      ? OmitRecursive<TryArrayElement<T[K]>, O, DefaultType>[]
                      : OmitRecursive<T[K], O, DefaultType>;
              },
              O
          >
    : T;
