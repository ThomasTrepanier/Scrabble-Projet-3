import { ValidatorSpec } from './validators';

export type DynamicSettingsGet<T> = {
    /**
     * Get value from settings
     */
    [K in keyof T as `get${Capitalize<K extends string ? K : ''>}`]: () => T[K];
};

export type DynamicSettingsSet<T> = {
    /**
     * Get value from settings
     */
    [K in keyof T as `set${Capitalize<K extends string ? K : ''>}`]: (value: NonNullable<T[K]>) => void;
};

export type DynamicSettings<T> = DynamicSettingsGet<T> & DynamicSettingsSet<T>;

export type RestrictedSettings<T> = {
    /**
     * Get value from settings
     *
     * @param key
     * @returns
     */
    get: <K extends keyof T>(key: K) => T[K];

    /**
     * Set value to settings
     *
     * @param key
     * @param value
     */
    set: <K extends keyof T>(key: K, value: NonNullable<T[K]>) => void;

    /**
     * Pipe value from settings through a series of operators and sets its value.
     *
     * **Example usage :**
     * ```typescript
     * // Get value from settings, multiply it by 4, max its value by 12, then store its value in the settings and returns it.
     * const updatedNumber = mySettings.get(
     *      'number',
     *      (value) => (value ?? 1) * 4,
     *      (value) => Math.max(value, 12),
     * );
     * ```
     *
     * **Example with operators :**
     * ```typescript
     * const clamp =
     *      (min: number, max: number) =>
     *      (value: number | undefined) =>
     *          Math.min(max, Math.max(value ?? 0));
     *
     * // Get value from settings, clamp it between 0 and 10, then store its value in the settings and returns it.
     * const updatedNumber = mySettings.get('number', clamp(0, 10));
     * ```
     *
     * @param key
     * @param callback
     * @returns Value returned by the operators
     */
    pipe: <K extends keyof T>(
        key: K,
        operator0: (value: T[K]) => NonNullable<T[K]>,
        ...operators: ((value: NonNullable<T[K]>) => NonNullable<T[K]>)[]
    ) => NonNullable<T[K]>;

    /**
     * Check whether a key has a value set.
     *
     * @param key
     * @returns
     */
    has: <K extends keyof T>(key: K) => boolean;

    /**
     * Removes value from settings
     *
     * @param key
     */
    remove: <K extends keyof T>(key: K) => void;

    /**
     * Removes all values from settings. (Only affect values in this instance of settings)
     */
    reset: () => void;
};

export type Settings<T> = DynamicSettings<T> & RestrictedSettings<T>;

export type SettingsSpecs<T> = { [K in keyof T]: ValidatorSpec<T[K]> };

interface SettingsProperties {
    restricted?: boolean;
}

export interface SettingsFn {
    /**
     * Creates settings instance
     *
     * **Example :**
     * ```typescript
     * const mySettings = settings({
     *      number: num(),
     *      string: str({ default: '' }),
     *      date: date({ isRequired: true }),
     * });
     *
     * // Returns number or undefined
     * const myNumber = mySettings.get('number');
     * // Returns string or default value
     * const myString = mySettings.get('string');
     * // Returns date of throw if not present
     * const myDate = mySettings.get('date');
     * ```
     *
     * @param specs
     * @param properties If setting properties.restricted, extended setters and getters functions will be unavailable.
     */
    <T, P extends SettingsProperties = SettingsProperties>(specs: SettingsSpecs<T>, properties?: P): P extends { restricted: true }
        ? RestrictedSettings<T>
        : Settings<T>;

    /**
     * Creates settings instance in namespace
     *
     * **Example :**
     * ```typescript
     * // Values will be saved as `my-namespace.VALUE`
     * const mySettings = settings('my-namespace', {
     *      number: num(),
     *      string: str({ default: '' }),
     *      date: date({ isRequired: true }),
     * });
     *
     * // Returns number or undefined
     * const myNumber = mySettings.get('number');
     * // Returns string or default value
     * const myString = mySettings.get('string');
     * // Returns date of throw if not present
     * const myDate = mySettings.get('date');
     * ```
     *
     * @param namespace Groups settings fields togethers
     * @param specs
     * @param properties If setting properties.restricted, extended setters and getters functions will be unavailable.
     */
    <T, P extends SettingsProperties = SettingsProperties>(namespace: string, specs: SettingsSpecs<T>, properties?: P): P extends { restricted: true }
        ? RestrictedSettings<T>
        : Settings<T>;
}
