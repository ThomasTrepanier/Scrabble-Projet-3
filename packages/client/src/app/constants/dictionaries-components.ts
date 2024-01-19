export const DELETE_COMPONENT_TITLE = 'Supprimer un dictionnaire';
export const FILE_NOT_DICTIONARY = "Le fichier ne respecte pas le format {'title', 'description','words'}.";
export const WRONG_FILE_TYPE = "Le fichier n'est pas un fichier JSON.";

export const SNACK_BAR_SUCCESS_DURATION = 2000;
export const SNACK_BAR_ERROR_DURATION = 100000;

export enum PositiveFeedback {
    DictionaryUpdated = 'Le dictionnaire a été mis à jour.',
    DictionaryAdded = 'Le dictionnaire a été ajouté avec succès.',
    DictionaryDeleted = 'Le dictionnaire a été supprimé avec succès.',
    DictionariesDeleted = 'La liste de dictionnaires a été réinitialisée.',
}
