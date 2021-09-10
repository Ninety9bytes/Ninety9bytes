import { ProcessingService } from '../../services/processing.service';
import { DepreciationService } from '../services/depreciation.service';
import { DepreciationFormService } from '../services/depreciation-form.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadCrumb } from '../../../_models/breadcrumbs.model';

@Component({
  selector: 'depreciation-form',
  templateUrl: './depreciation-form.component.html'
})
export class DepreciationFormComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  isReadyForProcessing = false;
  target: number;
  isLoading = true;
  errorMessage = 'Unable to process data.';

  breadCrumbs = [
    <BreadCrumb>{ name: 'Setup Rules', routerLink: 'Setup' },
    <BreadCrumb>{ name: 'Summary', routerLink: 'Summary', isDisabled: true }
  ];

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  constructor(
    private processingService: ProcessingService,
    private router: Router,
    private route: ActivatedRoute,
    private depreciationFormService: DepreciationFormService
  ) {}

  ngOnInit() {
    this.processingService.groupId = this.route.parent.snapshot.paramMap.get('groupId');

    const getProcessingStatus = this.processingService.getProcessingStatus(this.processingService.groupId);
    const getDepreciationMethods = this.depreciationFormService.getDepreciationMethods();
    const getDepreciationConventions = this.depreciationFormService.getDepreciationConventions();

    forkJoin(getProcessingStatus, getDepreciationMethods, getDepreciationConventions)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([processingStatus, depreciationMethods, depreciationConventions]) => {
        this.processingService.updateReferenceData(depreciationMethods.result.enumOptions, 'DepreciationMethod');
        this.processingService.updateReferenceData(depreciationConventions.result.enumOptions, 'DepreciationConvention');

        this.isReadyForProcessing = processingStatus.isReadyForProcessing;
        this.processingService.dataTarget = processingStatus.target;

        if (!this.isReadyForProcessing) {
          this.errorMessage = this.processingService.getProcessingErrorMessage(processingStatus);
        }

        this.isLoading = false;
      },
      error => {},
      () => {
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  navigateToImportData(event: any): void {
    event.preventDefault();
    this.router.navigate([`project-profile/${this.processingService.groupId}/DataImport`]);
  }
}
