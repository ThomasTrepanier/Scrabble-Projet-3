import { IconName } from '@app/components/icon/icon.component.type';

export enum AlertType {
    Error = 'error',
    Warn = 'warn',
    Success = 'success',
    Info = 'info',
}

export interface Alert {
    type: AlertType;
    content: string;
    icon?: IconName;
    log?: string;
}
