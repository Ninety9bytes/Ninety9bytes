export interface CopyGroupsDto {
  fromGroupIds: string[];
  toGroupId?: string;
  toGroupName: string;
  dataTargetTo?: number;
  memberIds: string[];
  siteIds: string[];
  replace: boolean;
  prosRenewal: boolean;
}