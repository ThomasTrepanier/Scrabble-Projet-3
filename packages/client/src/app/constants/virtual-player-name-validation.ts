const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;
const VALIDATION_RULE = "^([0-9A-Za-zÀ-ÖØ-öø-ÿ]+[ '\\-_]{0,1})*$";

export const VIRTUAL_PLAYER_NAME_VALIDATION = {
    minLength: MIN_NAME_LENGTH,
    maxLength: MAX_NAME_LENGTH,
    rule: VALIDATION_RULE,
};
