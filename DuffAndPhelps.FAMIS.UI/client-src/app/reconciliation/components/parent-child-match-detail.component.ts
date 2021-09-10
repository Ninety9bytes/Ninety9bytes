import { ReconcileDataService } from '../services/reconcile-data.service';
import { HelperService } from '../../_core/services/helper.service';
import { ParentChildService } from '../services/parent-child.service';
import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { OnInit, Component } from '@angular/core';
import { Asset } from '../../_models/asset.model';

@Component({
  selector: 'parent-child-match-detail',
  templateUrl: './parent-child-match-detail.component.html'
})
export class ParentChildMatchDetailComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public headers = [];

  public children: Array<Asset>;

  constructor(
    private reconcileDataService: ReconcileDataService,
    private helperService: HelperService,
    private parentChildService: ParentChildService,
    private assetFileInfoService: AssetFileInfoService
  ) {}

  ngOnInit() {
    this.parentChildService.children$.subscribe(currentChildren => {
      this.children = currentChildren;
    });

    if (this.children.length > 0) {
      this.headers = this.helperService.getHeaders(this.children[0], this.assetFileInfoService.GetInternalColumns());
    }
  }

  public showColumn(columnKey: string): boolean {
    const hideColumn =
      this.reconcileDataService.defaultColumns
      .indexOf(columnKey) !== -1 || this.assetFileInfoService.GetInternalColumns().indexOf(columnKey) !== -1;
    return hideColumn;
  }
}
