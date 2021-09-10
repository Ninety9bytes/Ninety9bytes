import { FieldMatchTermDto } from './field-match-term.dto';

export interface FieldMatchDto {
  id?: string;
  leftTerm: FieldMatchTermDto;
  rightTerm: FieldMatchTermDto;
  operation: string;
  isNullOk: boolean;
}
