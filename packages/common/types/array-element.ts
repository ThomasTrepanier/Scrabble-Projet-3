export type ArrayElement<ArrayType extends unknown[]> = ArrayType extends (infer ElementType)[] ? ElementType : never;
export type TryArrayElement<T> = T extends (infer ElementType)[] ? ElementType : T;
