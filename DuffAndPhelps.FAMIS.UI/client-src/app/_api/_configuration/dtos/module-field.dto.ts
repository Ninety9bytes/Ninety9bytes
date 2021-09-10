export interface ModuleFieldDto {
  id: string;
  name: string;
  dataType: string;
  moduleId: string;
  order: number;
  isRequired: boolean;
  mustBePresentOnModule: boolean;
}
