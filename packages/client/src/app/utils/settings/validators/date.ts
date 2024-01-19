import { DateValidator, SettingsSpec, ValidatorSpec } from './types';

export const date: DateValidator = <T extends Date = Date>(spec?: SettingsSpec<T>): ValidatorSpec<T> => {
    const parse = (key: string, value: unknown): T => {
        const s = { default: undefined, isRequired: false, ...((spec ?? {}) as SettingsSpec<T>) };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = new Date(value as any);
        const out = (d && !isNaN(d.getTime()) ? d : s.default) as T;

        if (s.default === undefined && !s.isRequired) {
            return out;
        }

        if (!out)
            throw new Error(
                `No settings found for key "${key}. Did you forget to set it beforehand?${s.explanation ? `\n\t${key}: ${s.explanation}` : ''}"`,
            );

        return out;
    };

    return { parse };
};
