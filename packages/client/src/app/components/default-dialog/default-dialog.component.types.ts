import { IconName } from '@app/components/icon/icon.component.type';

export interface DefaultDialogCheckboxParameters {
    content: string;
    checked: boolean;
    action?: (checked: boolean) => void;
}

export interface DefaultDialogButtonParameters {
    content: string;
    closeDialog?: boolean;
    action?: () => void;
    redirect?: string;
    style?: string;
    icon?: IconName;
    key?: string;
}
export interface DefaultDialogParameters {
    title: string;
    content: string;
    buttons: DefaultDialogButtonParameters[];
    checkbox?: DefaultDialogCheckboxParameters;
}
