import { FieldType } from '../_enums/field-type';

export class AssetFieldInput{
  public dateValue: Date;
  public isValid = true;
  public errorMessage = '';
  constructor(
    public fieldName: string,
    public displayName: string,
    public dataType: FieldType,
    public value: any,
    public isCustom: boolean,
  ) {}
}
