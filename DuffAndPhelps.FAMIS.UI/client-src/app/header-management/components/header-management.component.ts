import { HeaderManagementService } from '../services/header-management.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTargetName } from '../../_enums/data-target-name';

@Component({
  selector: 'header-management',
  templateUrl: './header-management.component.html'
})
export class HeaderManagementComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public isLoading = false;

  constructor(
    private headerManagementService: HeaderManagementService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.headerManagementService.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.headerManagementService.dataTarget = DataTargetName.client;
  }

  ngOnDestroy() {}
}
