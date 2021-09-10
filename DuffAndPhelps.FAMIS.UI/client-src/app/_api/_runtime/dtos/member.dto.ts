import { BuildingDto } from './building.dto';

export interface MemberDto {
    id: string;
    memberName: string;
    memberNumber: string;
    expectedStartDate: Date;
    draftDeliveryDate: Date;
    projectedDate: Date;
    finalDate: Date;
    accountingAsOfDate: Date;
    insuranceAsOfDate: Date;
    appraisalAsOfDate: Date;
    memberStatus: number;
    groupName: string;
    buildings: Array<BuildingDto>;
}

export interface MemberResponseDto {
    numberInThisPayload: number;
    totalInRecordSet: number;
    members: MemberDto[];
  }