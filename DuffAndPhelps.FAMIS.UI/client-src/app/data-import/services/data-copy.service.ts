
import { CopyGroupComponent } from '../../portal-management/components/copy-group.component';
import { Injectable, ComponentRef } from '@angular/core';
import { DataImportRepository } from '../../_api/services/data-import/data-import-repository.service';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { Observable } from 'rxjs';
import { ImportTemplateDto } from '../../_api/dtos/data-import/import-template.dto';
import { CopyGroupsDto } from '../../_api/_runtime/dtos/copy-groups.dto';

@Injectable()
export class DataCopyService {

    activeDataTargetName: string;
    activeReplace: boolean;
    activeSelections: Array<ComponentRef<CopyGroupComponent>>;
    isError: boolean;
    errorMessage: string;
    copyFromGroupIds: Array<string>;

    constructor(
        private repository: DataImportRepository,
        private groupService: GroupApiService,
        private inventoryService: InventoryApiService
    ) {}

    getDataTargets(): Observable<ImportTemplateDto[]> {
        return this.repository.getDataTargets();
    }

    public copyGroups(request: CopyGroupsDto): Observable<string> {
        return this.groupService.copyGroups(request, true);
    }

    public getAssetCount(groupId: string, dataTarget: number, handleLocalError): Observable<number> {
        return this.inventoryService.getAssetCountByGroup(groupId, dataTarget, handleLocalError);
    }
}