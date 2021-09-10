import { AlertType } from '../_enums/alert-type';

export interface Alert {
    type: AlertType;
    message: string;
}
