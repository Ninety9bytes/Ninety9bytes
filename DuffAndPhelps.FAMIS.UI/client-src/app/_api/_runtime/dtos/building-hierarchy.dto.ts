export interface BuildingHierarchyDto {
  id: string;
  name: string;
  buildings: HierarchyBuildingDto[];
  members: HierarchyMemberDto[];
}

export interface HierarchyMemberDto {
  id: string;
  name: string;
  identifier: string;
  sites: HierarchySiteDto[];
}

export interface HierarchySiteDto {
  id: string;
  name: string;
  identifier: string;
  buildings: HierarchyBuildingDto[];
}

export interface HierarchyBuildingDto {
  type: number;
  id: string;
  identifier: string;
  name: string;
}
