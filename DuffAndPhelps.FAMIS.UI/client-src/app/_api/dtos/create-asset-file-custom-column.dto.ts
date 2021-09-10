export class CreateAssetFileCustomColumnDto {
  public columnName: string;
  public dataType: number;

  constructor(
  columnName: string,
  customFieldType: number) {
    this.columnName = columnName;
    this.dataType = customFieldType;
  }
}
