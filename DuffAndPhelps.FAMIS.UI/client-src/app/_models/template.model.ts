import { TemplateField } from './template-field.model';

export class Template {

  constructor(
  public Id?: string,
  public Name?: string,
  public CountryId?: string,
  public TemplateFields?: Array<TemplateField>,
  public IsMasterTemplate?: boolean,
  public IsRetired?: boolean) { }
}