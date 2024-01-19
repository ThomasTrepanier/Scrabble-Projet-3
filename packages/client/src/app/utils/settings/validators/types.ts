/* eslint-disable @typescript-eslint/ban-types */
export interface SettingsSpecBase {
    explanation?: string;
}

export interface SettingsSpecRequired extends SettingsSpecBase {
    default?: undefined;
    isRequired: true;
}

export interface SettingsSpecDefaultValue<T> extends SettingsSpecBase {
    default: T;
    isRequired?: boolean;
}

export interface SettingsSpecUndefined extends SettingsSpecBase {
    default?: undefined;
    isRequired?: false;
}

export type SettingsSpec<T> = SettingsSpecRequired | SettingsSpecDefaultValue<T> | SettingsSpecUndefined;

export interface ValidatorSpecRequired<T> {
    parse(key: string, value: unknown): NonNullable<T>;
}

export interface ValidatorSpecDefaultValue<T> {
    parse(key: string, value: unknown): NonNullable<T>;
}

export interface ValidatorSpecUndefined<T> {
    parse(key: string, value: unknown): T;
}

export type ValidatorSpec<T> = ValidatorSpecRequired<T> | ValidatorSpecDefaultValue<T> | ValidatorSpecUndefined<T>;

export interface BoolValidator {
    /**
     * Declare boolean setting.
     *
     * Return value will be `boolean | undefined` for `get` function.
     *
     * Valid boolean values includes :
     * * **True** : `true`, `t`, `yes`, `y`, `1`
     * * **False** : `false`, `f`, `no`, `n`, `0`
     *
     * If the value is invalid, the function will return undefined.
     *
     * ```typescript
     * settings({
     *      myBool: bool(),
     * });
     * ```
     */
    <T extends boolean | undefined = boolean | undefined>(spec?: SettingsSpecUndefined): ValidatorSpecUndefined<T>;

    /**
     * Declare boolean setting.
     *
     * Return value will be `boolean` for `get`function. If value is not set, default value will be returned.
     *
     * Valid boolean values includes :
     * * **True** : `true`, `t`, `yes`, `y`, `1`
     * * **False** : `false`, `f`, `no`, `n`, `0`
     *
     * If the value is invalid, the function will return the default value.
     *
     * ```typescript
     * settings({
     *      myBool: bool({ default: false }),
     * });
     * ```
     */
    <T extends boolean = boolean>(spec: SettingsSpecDefaultValue<T>): ValidatorSpecDefaultValue<T>;

    /**
     * Declare boolean settings.
     *
     * Return value will be `boolean` for `get` function. If value is not set, an error will be thrown.
     *
     * Valid boolean values includes :
     * * **True** : `true`, `t`, `yes`, `y`, `1`
     * * **False** : `false`, `f`, `no`, `n`, `0`
     *
     * If the value is invalid, and error will be thrown.
     *
     * ```typescript
     * settings({
     *      myBool: bool({ isRequired: true }),
     * });
     * ```
     */
    <T extends boolean = boolean>(spec: SettingsSpecRequired): ValidatorSpecRequired<T>;
}

export interface DateValidator {
    /**
     * Declare date setting.
     *
     * Return value will be `Date | undefined` for `get` function.
     *
     * Valid date value includes all values accepted in the Date constructor.
     *
     * If the value is invalid, the function will return undefined.
     *
     * ```typescript
     * settings({
     *      myDate: date(),
     * });
     * ```
     */
    <T extends Date | undefined = Date | undefined>(spec?: SettingsSpecUndefined): ValidatorSpecUndefined<T>;

    /**
     * Declare date setting.
     *
     * Return value will be `Date` for `get` function.
     *
     * Valid date value includes all values accepted in the Date constructor.
     *
     * If the value is invalid, the function will return the default value.
     *
     * ```typescript
     * settings({
     *      myDate: date({ default: new Date() }),
     * });
     * ```
     */
    <T extends Date = Date>(spec: SettingsSpecDefaultValue<T>): ValidatorSpecDefaultValue<T>;

    /**
     * Declare date setting.
     *
     * Return value will be `Date` for `get` function.
     *
     * Valid date value includes all values accepted in the Date constructor.
     *
     * If the value is invalid, an error will be thrown.
     *
     * ```typescript
     * settings({
     *      myDate: date({ isRequired: true }),
     * });
     * ```
     */
    <T extends Date = Date>(spec: SettingsSpecRequired): ValidatorSpecRequired<T>;
}

export interface JSONValidator {
    /**
     * Declare JSON setting.
     *
     * Return value will be `object | undefined` for `get` function.
     *
     * Valid json value includes all values parsed by JSON.parse.
     *
     * If the value is invalid, the function will return undefined.
     *
     * ```typescript
     * settings({
     *      myObject: json<MyType>(),
     * });
     * ```
     */
    <T extends object | undefined = object | undefined>(spec?: SettingsSpecUndefined): ValidatorSpecUndefined<T>;

    /**
     * Declare JSON setting.
     *
     * Return value will be `object` for `get` function.
     *
     * Valid json value includes all values parsed by JSON.parse.
     *
     * If the value is invalid, the function will return the default value.
     *
     * ```typescript
     * settings({
     *      myObject: json<MyType>({ default: new Date() }),
     * });
     * ```
     */
    <T extends object = object>(spec: SettingsSpecDefaultValue<T>): ValidatorSpecDefaultValue<T>;

    /**
     * Declare JSON setting.
     *
     * Return value will be `object` for `get` function.
     *
     * Valid json value includes all values parsed by JSON.parse.
     *
     * If the value is invalid, an error will be thrown.
     *
     * ```typescript
     * settings({
     *      myObject: json<MyType>({ isRequired: true }),
     * });
     * ```
     */
    <T extends object = object>(spec: SettingsSpecRequired): ValidatorSpecRequired<T>;
}

export interface NumberValidator {
    /**
     * Declare number setting.
     *
     * Return value will be `number | undefined` for `get` function.
     *
     * Valid number value includes all values parsed by the Number constructor.
     *
     * If the value is invalid, the function will return undefined.
     *
     * ```typescript
     * settings({
     *      myNumber: num(),
     * });
     * ```
     */
    (spec?: SettingsSpecUndefined): ValidatorSpecUndefined<number | undefined>;

    /**
     * Declare number setting.
     *
     * Return value will be `number` for `get` function.
     *
     * Valid number value includes all values parsed by the Number constructor.
     *
     * If the value is invalid, the function will return the default value.
     *
     * ```typescript
     * settings({
     *      myNumber: num(),
     * });
     * ```
     */
    (spec: SettingsSpecDefaultValue<number>): ValidatorSpecDefaultValue<number>;

    /**
     * Declare number setting.
     *
     * Return value will be `number` for `get` function.
     *
     * Valid number value includes all values parsed by the Number constructor.
     *
     * If the value is invalid, an error will be thrown.
     *
     * ```typescript
     * settings({
     *      myNumber: num(),
     * });
     * ```
     */
    (spec: SettingsSpecRequired): ValidatorSpecRequired<number>;
}

export interface StringValidator {
    /**
     * Declare string setting.
     *
     * Return value will be `string | undefined` for `get` function.
     *
     * Valid string value includes all values parsed by the String constructor.
     *
     * If the value is invalid, the function will return undefined.
     *
     * ```typescript
     * settings({
     *      myString: str(),
     * });
     * ```
     */
    (spec?: SettingsSpecUndefined): ValidatorSpecUndefined<string | undefined>;

    /**
     * Declare string setting.
     *
     * Return value will be `string` for `get` function.
     *
     * Valid string value includes all values parsed by the String constructor.
     *
     * If the value is invalid, the function will return the default value.
     *
     * ```typescript
     * settings({
     *      myString: str(),
     * });
     * ```
     */
    (spec: SettingsSpecDefaultValue<string>): ValidatorSpecDefaultValue<string>;

    /**
     * Declare string setting.
     *
     * Return value will be `string` for `get` function.
     *
     * Valid string value includes all values parsed by the String constructor.
     *
     * If the value is invalid, an error will be thrown.
     *
     * ```typescript
     * settings({
     *      myString: str(),
     * });
     * ```
     */
    (spec: SettingsSpecRequired): ValidatorSpecRequired<string>;
}
