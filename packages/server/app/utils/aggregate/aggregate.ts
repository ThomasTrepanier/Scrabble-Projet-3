/* eslint-disable @typescript-eslint/ban-types */

interface AggregateConfig<
    T extends object,
    IdKey extends keyof T,
    FieldKey extends string | number,
    MainItemKeys extends keyof T,
    AggregatedItemKey extends keyof Omit<T, FieldKey>,
> {
    /** Key used to identify row. Rows with the same id key will be aggregated together */
    idKey: IdKey;
    /** Key used to group aggregated items */
    fieldKey: FieldKey;
    /** Item keys that will be kept in the parent object. */
    mainItemKeys: MainItemKeys[];
    /** Item keys that will be placed in the aggregated rows */
    aggregatedItemKeys: AggregatedItemKey | AggregatedItemKey[];
}

/**
 * Aggregate rows together.
 *
 * **Example :**
 * ```typescript
 * const rows = [
 *  { id: 1, name: 'john', fruit: 'banana' },
 *  { id: 1, name: 'john', fruit: 'pineapple' },
 *  { id: 2, name: 'anna', fruit: 'apple' },
 * ];
 *
 * const result = aggregate(rows, {
 *  idKey: 'id',
 *  fieldKey: 'favoriteFruit',
 *  mainItemKeys: ['id', 'name'],
 *  aggregatedItemKeys: ['fruit'],
 * });
 *
 * expect(rows).toEqual([
 *  {
 *    id: 1,
 *    name: 'john',
 *    favoriteFruit: [
 *      { fruit: 'banana' },
 *      { fruit: 'pineapple' },
 *    ],
 *  },
 *  {
 *    id: 2,
 *    name: 'anna',
 *    favoriteFruit: [
 *      { fruit: 'apple' },
 *    ],
 *  },
 * ]); // true
 * ```
 */
export const aggregate = <
    T extends object,
    IdKey extends keyof T,
    FieldKey extends string | number,
    MainItemKeys extends keyof Omit<T, FieldKey>,
    AggregatedItemKey extends keyof Omit<T, FieldKey>,
    AggregatedItemKeys extends keyof AggregatedItemKey | AggregatedItemKey[],
    AggregatedItem = AggregatedItemKeys extends AggregatedItemKey[] ? { [K in AggregatedItemKey]: T[MainItemKeys] } : T[AggregatedItemKey],
    MainItem = { [K in MainItemKeys]: T[MainItemKeys] } & { [K in FieldKey]: AggregatedItem[] },
>(
    items: T[],
    { idKey, fieldKey, mainItemKeys, aggregatedItemKeys }: AggregateConfig<T, IdKey, FieldKey, MainItemKeys, AggregatedItemKey>,
) => {
    const makeMainItem = (item: T): MainItem => {
        const mainItem: { [K in MainItemKeys]?: T[K] } & { [K in FieldKey]: AggregatedItem[] } = {
            [fieldKey]: new Array<AggregatedItem>(),
        } as { [K in MainItemKeys]?: T[K] } & { [K in FieldKey]: AggregatedItem[] };

        for (const key of mainItemKeys) {
            (mainItem[key] as unknown) = item[key];
        }

        return mainItem as unknown as MainItem;
    };

    const makeAggregatedItem = Array.isArray(aggregatedItemKeys)
        ? (item: T): AggregatedItem => {
              const aggregatedItem: Partial<T> = {};

              for (const key of aggregatedItemKeys) {
                  aggregatedItem[key] = item[key];
              }

              return aggregatedItem as AggregatedItem;
          }
        : (item: T): AggregatedItem => item[aggregatedItemKeys as unknown as keyof T] as unknown as AggregatedItem;

    return [
        ...items
            .reduce((map, c) => {
                const entry: MainItem = map.get(c[idKey]) ?? makeMainItem(c);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                entry[fieldKey as any].push(makeAggregatedItem(c));

                map.set(c[idKey], entry);

                return map;
            }, new Map<T[IdKey], MainItem>())
            .values(),
    ];
};
