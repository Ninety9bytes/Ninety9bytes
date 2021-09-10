import { ReportType } from '../../enums/report-type';

export interface ReportDto {
  id: string;
  type: ReportType;
  name: string;
  fileExtension: string;
  isInsurance: boolean;
  isFixedAsset: boolean;
}
