import { AdvancedMathOperator } from '../enums/advanced-math-operator';
import { AdvancedMathType } from '../enums/advanced-math-type';

export interface MassUpdateRequestAdvancedTermDto {
  leftTerm: MassUpdateRequestAdvancedTermDto;
  rightTerm: MassUpdateRequestAdvancedTermDto;
  operator: AdvancedMathOperator;
  value: string;
  type: AdvancedMathType;
}