import { BuildingHierarchyDto, HierarchyMemberDto } from './building-hierarchy.dto';

export interface ClientHierarchyDto {
    id: string;
    mame: string;
    contracts: ContractHierarchyDto[];
}

export interface ContractHierarchyDto {
    id: string;
    name: string;
    groups: GroupHierarchyDto[];
}

export interface GroupHierarchyDto {
    id: string;
    name: string;
    buildings: BuildingHierarchyDto[];
    members: HierarchyMemberDto[];
}