
export class TemplateModuleField {

  constructor(
    public id: string,
    public name: string,
    public dataType: string,
    public moduleId: string,
    public order: number,
    public isRequired: boolean) {
  }
}
