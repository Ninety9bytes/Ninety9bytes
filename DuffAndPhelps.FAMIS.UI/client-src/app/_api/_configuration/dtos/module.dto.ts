import { ModuleFieldDto } from './module-field.dto';

export interface ModuleDto {
  id: string;
  name: string;
  isEditable: boolean;
  moduleFields: Array<ModuleFieldDto>;
  componentName?:string;
  menuOrder?:number;
}
