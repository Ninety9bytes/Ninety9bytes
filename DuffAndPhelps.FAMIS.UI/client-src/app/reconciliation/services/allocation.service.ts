import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Asset } from '../../_models/asset.model';

@Injectable()
export class AllocationService {

    private selectedInventoryAssets = new BehaviorSubject<Array<any>>(new Array<any>());
    currentSelectedInventory = this.selectedInventoryAssets.asObservable();

    private selectedClientAssets = new BehaviorSubject<Array<any>>(new Array<any>());
    currentSelectedClientAsset = this.selectedClientAssets.asObservable();

    private selectedMatchCode = new BehaviorSubject<string>('');
    currentSelectedMatchCode = this.selectedMatchCode.asObservable();
    constructor() { }

    changeSelectedInventoryAssets(updatedSelection: Array<any>, isAdded: boolean){
        this.addOrRemove(updatedSelection, isAdded, false);
    }

    changeSelectedClientAssets(updatedSelection: Array<any>, isAdded: boolean){
        this.addOrRemove(updatedSelection, isAdded, true);
    }

    changeSelectedMatchCode(updatedSelection: string){
        this.selectedMatchCode.next(updatedSelection);
    }

    setSelectedInventoryAssets(assets: Array<Asset>){

    }

    clearSelections(){
        this.selectedMatchCode.next('');
        this.selectedClientAssets.next(new Array<any>());
        this.selectedInventoryAssets.next(new Array<any>());
    }

    private addOrRemove(updatedSelection: Array<any>, isAdded: boolean, isClient: boolean){
        const current = isClient ? this.selectedClientAssets.getValue() : this.selectedInventoryAssets.getValue();
        updatedSelection.forEach(row => {
            if (isAdded) {
                current.push(row);
            } else {
                current.splice(current.findIndex(c => c.Id === row.Id), 1);
            }
        });

        if (isClient) {
            this.selectedClientAssets.next(current);
        } else {
            this.selectedInventoryAssets.next(current);
        }
    }


}