import { CopyGroupComponent } from '../../portal-management/components/copy-group.component';
import { DataCopyService } from '../services/data-copy.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ComponentRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTargetName } from '../../_enums/data-target-name';

@Component({
  selector: 'app-data-copy-finish',
  templateUrl: './data-copy-finish.component.html'
})
export class DataCopyFinishComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public groupId: string;
  public copyFromGroupIds: Array<string>;
  public rowsCopied: number;
  isError: boolean;
  errorMessage: string;
  dataTargetName: string;
  replace: boolean;
  selections: Array<ComponentRef<CopyGroupComponent>>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataCopyService: DataCopyService
  ) { }

  ngOnInit() {
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.isError = this.dataCopyService.isError;
    this.errorMessage = this.dataCopyService.errorMessage;
    this.dataTargetName = this.dataCopyService.activeDataTargetName;
    this.replace = this.dataCopyService.activeReplace;
    this.selections = this.dataCopyService.activeSelections;
    this.copyFromGroupIds = this.dataCopyService.copyFromGroupIds;

    let dataTarget: DataTargetName;
    if (this.dataTargetName === 'Client Inventory') {
      dataTarget = DataTargetName.client;
    } else if (this.dataTargetName === 'Actual Inventory') {
      dataTarget = DataTargetName.inventory;
    }

    if (!this.isError) {
      this.rowsCopied = 0;
      this.copyFromGroupIds.forEach(id =>
        this.dataCopyService.getAssetCount(id, dataTarget, true).subscribe((res: number) => {
          if (!res) {
            this.rowsCopied = 0;
          }
          this.rowsCopied += res;
        },
          error => {
            this.rowsCopied = 0;
          }

        ));
    }

  }

  finish(event: any) {
    this.router.navigate([`/project-profile/${this.groupId}/MainProfile`]);
  }
}
