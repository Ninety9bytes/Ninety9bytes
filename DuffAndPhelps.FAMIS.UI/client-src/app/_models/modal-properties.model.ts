import { TranslationDetails } from './translation-details.model';

export interface ModalProperties {
    heading: TranslationDetails;
    body: TranslationDetails;
    dismissText?: TranslationDetails;
    successText?: TranslationDetails;
    translateBaseKey: string;
}


