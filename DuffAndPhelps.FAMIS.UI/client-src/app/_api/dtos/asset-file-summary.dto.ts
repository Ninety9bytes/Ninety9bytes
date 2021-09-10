import { FieldMetaDataDto } from './inventory/field-meta-data.dto';


export interface AssetFileSummaryDto {
  id: string;
  fields: Array<FieldMetaDataDto>;
}
