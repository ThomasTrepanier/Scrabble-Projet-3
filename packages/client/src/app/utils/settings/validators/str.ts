import { SettingsSpec, StringValidator, ValidatorSpec } from './types';

export const str: StringValidator = (spec?: SettingsSpec<string>): ValidatorSpec<string> => {
    const parse = (key: string, value: unknown): string => {
        const s = { default: undefined, isRequired: false, ...((spec ?? {}) as SettingsSpec<string>) };

        const out = (value ? String(value) : s.default) as string;

        if (s.default === undefined && !s.isRequired) {
            return out;
        }

        if (out === undefined)
            throw new Error(
                `No settings found for key "${key}. Did you forget to set it beforehand?${s.explanation ? `\n\t${key}: ${s.explanation}` : ''}"`,
            );

        return out;
    };

    return { parse };
};
