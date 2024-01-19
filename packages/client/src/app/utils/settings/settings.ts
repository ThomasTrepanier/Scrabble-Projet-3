import store from 'store2';
import { DynamicSettings, SettingsFn, SettingsSpecs } from './types';
import { toGetter, toSetter } from './utils';

export const settings: SettingsFn = <T>(namespaceOrSpec: string | SettingsSpecs<T>, maybeSpecs?: SettingsSpecs<T>) => {
    const namespace = typeof namespaceOrSpec === 'string' ? namespaceOrSpec : undefined;
    const specs = (maybeSpecs ? maybeSpecs : namespaceOrSpec) as SettingsSpecs<T>;

    const settingsStore = store.namespace(namespace ?? 'scrabble');

    const get = <K extends keyof T>(key: K): T[K] => {
        return specs[key].parse(key as string, settingsStore.has(key) ? settingsStore.get(key) : undefined);
    };

    const set = <K extends keyof T>(key: K, value: NonNullable<T[K]>): void => {
        settingsStore.set(key, value);
    };

    const pipe = <K extends keyof T>(
        key: K,
        callback0: (value: T[K]) => NonNullable<T[K]>,
        ...callback: ((value: NonNullable<T[K]>) => NonNullable<T[K]>)[]
    ): NonNullable<T[K]> => {
        const value = callback.reduce((v, f) => f(v), callback0(get(key))) as NonNullable<T[K]>;
        set(key, value);
        return value;
    };

    const has = <K extends keyof T>(key: K): boolean => {
        return settingsStore.has(key);
    };

    const remove = <K extends keyof T>(key: K): void => {
        settingsStore.remove(key);
    };

    const reset = (): void => {
        settingsStore.clear();
    };

    const getters: DynamicSettings<T> = {} as DynamicSettings<T>;

    for (const key of Object.keys(specs) as (keyof T)[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getters[toGetter(String(key)) as keyof DynamicSettings<T>] as any) = () => get(key);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getters[toSetter(String(key)) as keyof DynamicSettings<T>] as any) = (value: NonNullable<T[typeof key]>) => set(key, value);
    }

    return { get, set, pipe, has, remove, reset, ...getters };
};
