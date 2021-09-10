import { ParentChildService } from '../services/parent-child.service';
import { AlertService } from '../../_core/services/alert.service';
import { GridComponent } from '@progress/kendo-angular-grid/dist/es/grid.component';
import { ResultType } from '../../_enums/result-type';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { concat, Observable } from 'rxjs';
import { Component, OnInit, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { ReconciliationSummaryResult } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { ReconcileParentChild } from '../../_models/reconcile-parent-child.model';
import { Asset } from '../../_models/asset.model';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { WindowOption } from '../../_models/window-option';
import { MatchOrAllocationResult } from '../../_api/dtos/reconciliation/match-or-allocation-result.dto';

@Component({
  selector: 'parent-child-match',
  templateUrl: './parent-child-match.component.html'
})
export class ParentChildMatchComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @ViewChild('content', {static: false}) private content: any;
  @Output() parentChildMatch = new EventEmitter<ApiServiceResult<ReconciliationSummaryResult[]>>();
  @Output() parentChildRemoved = new EventEmitter<string[]>();
  closeResult: string;

  title: string;
  saveText: string;

  parentAssetId: string;
  public assetsGridData: Array<ReconcileParentChild>;
  reconcileParentChild: ReconcileParentChild;
  public isEdit = false;
  public showSelectParentAlert = false;
  public removedIds = Array<string>();

  public children = new Array<Asset>();

  isConfirmOpen = false;
  confirmMessage = '';
  confirmHeader = 'Confirm';

  windowRef: WindowRef;
  private defaultParentIndex = -1;
  showMatchedChildAssigned = false;

  constructor(
    private windowManager: WindowManager,
    private alertService: AlertService,
    private parentChildService: ParentChildService,
  ) {}

  ngOnInit() {
    this.parentChildService.children$.subscribe(children => {
      this.children = children;
    });

    this.parentChildService.currentSelectedAssets.subscribe(currentSelectedAssets => {
      this.assetsGridData = currentSelectedAssets;
    });
  }

  public open(event: any) {
    event.preventDefault();
    this.showMatchedChildAssigned = false;
    this.parentChildService.isValidSelection(this.assetsGridData).subscribe(result => {
      if (!result) {
        this.alertService.error(this.parentChildService.getValidationErrors());
        return;
      }

      this.loadItems(this.getChildAssetIds());

      this.title = 'Parent / Child Relationship';
      this.saveText = 'Apply';
      this.parentAssetId = null;
      this.showSelectParentAlert = false;

      this.defaultParentIndex = this.assetsGridData.findIndex(p => p.isMatched === true);
      if (this.defaultParentIndex !== -1) {
        this.selectParent(this.defaultParentIndex);
      }

      this.windowRef = this.windowManager.open(this.content, this.title, <WindowOption>{
        isModal: true,
        translationKey: this.i18n.reconciliation
      });

    });
  }

  public selectParent(rowIndex: any) {
    if (rowIndex != null) {
      const item = this.assetsGridData[rowIndex];
      if (this.defaultParentIndex !== -1) {
        if (this.assetsGridData[rowIndex].assetId !== this.assetsGridData[this.defaultParentIndex].assetId) {
          this.showMatchedChildAssigned = true;
          return;
        }
      }
      this.parentAssetId = item.assetId;
      this.showMatchedChildAssigned = false;
    }
  }

  onSubmit() {
    if (this.parentAssetId == null) {
      this.showSelectParentAlert = true;
      return;
    }
    if (this.showMatchedChildAssigned) {
      return;
    }

    const observables = new Array<Observable<ApiServiceResult<ReconciliationSummaryResult[] | MatchOrAllocationResult>>>();
    let assetsToRemove = new Array<string>();

    if (this.getOriginalParent() !== '' && this.parentAssetId !== this.getOriginalParent()) {
      const originalParent = this.getOriginalParent();
      assetsToRemove = this.getChildAssetIds();
      assetsToRemove.push(this.parentAssetId);
      assetsToRemove.splice(assetsToRemove.indexOf(originalParent), 1);
    }
    if (this.removedIds.length > 0) {
      this.removedIds.forEach(id => assetsToRemove.push(id));
    }

    if (assetsToRemove.length > 0 && this.isEdit) {
      const remove = this.parentChildService.removeChildMatches(assetsToRemove);
      observables.push(remove);
    }

    if (this.isEdit) {
      const adds = this.parentChildService.updateParentChildMatches(this.parentAssetId, this.getChildAssetIds());
      observables.push(adds);
    } else {
      const adds = this.parentChildService.setParentChildMatches(this.parentAssetId, this.getChildAssetIds());
      observables.push(adds);
    }

    concat(...observables).subscribe(
      c => {
        if (c.resultType === ResultType.reconciliationSummaryResult) {
          this.parentChildMatch.emit(<ApiServiceResult<ReconciliationSummaryResult[]>>c);
        }

        if (c.resultType === ResultType.matchOrAllocationResult) {
          const removedResult = <ApiServiceResult<MatchOrAllocationResult>>c;
          this.parentChildRemoved.emit(removedResult.result.assetIds);
        }

        this.windowRef.close();
      },
      error => {}
    );
  }

  private loadItems(assetIds: string[]) {
    this.parentChildService.getMatchSummaryForAssetIds(this.getChildAssetIds()).subscribe(data => {
      if (data.result.assetData.length === 0) {
        return;
      }
      data.result.assetData.forEach(match => {
        const element = this.assetsGridData.find(a => a.assetId === match.id);
        if (element != null) {
          element.isParent = match.isParent;
          element.parentId = match.parentId;
          if (element.isParent === true) {
            this.parentAssetId = element.assetId;
          }
        }
      });
      this.isEdit = true;
    });
  }

  private getOriginalParent(): string {
    let parents = this.assetsGridData.map(({ parentId }) => parentId);
    parents = parents.filter(function(v, i) {
      return v != null && parents.indexOf(v) === i;
    });
    if (parents.length === 0) {
      return '';
    }
    return parents[0];
  }

  private getChildAssetIds(): string[] {
    const assetIds = this.assetsGridData.map(({ assetId }) => assetId);
    const index = assetIds.indexOf(this.parentAssetId);
    if (index > -1) {
      assetIds.splice(index, 1);
    }
    return assetIds;
  }

  public onUnrelateAllItems(event: any) {
    event.preventDefault();

    this.confirmMessage = 'Are you sure you want to remove the associations from all items?';
    this.isConfirmOpen = true;
  }

  public onUnrelateRow(rowIndex: number, event: any, grid: GridComponent) {
    event.preventDefault();

    if (this.assetsGridData.length <= 2) {
      this.confirmMessage = 'Removing this item will unrelate all items. Are you sure?';
      this.isConfirmOpen = true;
    }

    this.removedIds.push(this.assetsGridData[rowIndex].assetId);
    this.assetsGridData.splice(rowIndex, 1);
  }

  public onConfirmed(isConfirmed: boolean) {
    this.isConfirmOpen = false;
    if (isConfirmed) {
      this.unrelateAllItems();
    }
  }

  public unrelateAllItems() {
    const ids = this.getChildAssetIds();
    if (this.removedIds.length > 0) {
      this.removedIds.forEach(id => ids.push(id));
    }

    this.parentChildService.removeChildMatches(ids).subscribe(removedEntities => {
      if (removedEntities) {
        let assetIds = new Array<string>();

        const removedResult = <MatchOrAllocationResult>removedEntities.result;

        assetIds = assetIds.concat(removedResult.assetIds);

        assetIds.push(this.parentAssetId);

        this.parentChildRemoved.emit(assetIds);
        this.windowRef.close();
      }
    });
  }

  cancel(): void {
    this.windowRef.close();
  }
}
