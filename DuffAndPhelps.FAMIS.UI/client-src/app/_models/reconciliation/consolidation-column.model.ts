import { DataTargetName } from '../../_enums/data-target-name';
import { FieldType } from '../../_enums/field-type';

export interface ConsolidationColumn {
    id: string;
    sourceTarget: DataTargetName;
    sourceColumn: string;
    destinationColumnName: string;
    displayName: string;
    selected: boolean;
    fieldType: FieldType;
    isCustom: boolean;
}
