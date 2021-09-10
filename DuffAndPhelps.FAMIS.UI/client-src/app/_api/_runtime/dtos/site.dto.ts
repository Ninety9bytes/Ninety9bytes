export interface SiteDto {
    id: string;
    siteName: string;
    siteNumber: number;
    memberId?: string;
    memberName?: string;
    buildings: Array<SiteBuildingDto>;
}

export interface SiteBuildingDto {
    id: string;
    buildingName: string;
}

export interface SiteResponseDto {
    numberInThisPayload: number;
    totalInRecordSet: number;
    sites: SiteDto[];
  }