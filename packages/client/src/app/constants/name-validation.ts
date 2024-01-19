const MIN_LENGTH = 1;
const MAX_LENGTH = 20;
const VALIDATION_RULE = "^([0-9A-Za-zÀ-ÖØ-öø-ÿ]+['-_]{0,1})*$";

export const NAME_VALIDATION = {
    minLength: MIN_LENGTH,
    maxLength: MAX_LENGTH,
    rule: VALIDATION_RULE,
};
