import { MassUpdateRequestAdvancedTermDto } from '../_api/_runtime/dtos/mass-update-request-advanced-term.dto';
import { FieldMetaDataDto } from '../_api/_runtime/dtos/field-meta-data.dto';

export interface ReplaceField {
    isAdvanced: boolean;
    replacementField: string;
    replacementValue: string;
    advancedReplacementValue: MassUpdateRequestAdvancedTermDto;
    advancedReplacementHtml: string;
    collection: Array<FieldMetaDataDto>;
}
