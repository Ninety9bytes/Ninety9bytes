import { FieldMetaDataDto } from './field-meta-data.dto';

export interface MassUpdateContext {
  defaultFilterTerm: Array<any>;
  filterMetaData: Array<FieldMetaDataDto>;
}
