import { ProcessingService } from '../../services/processing.service';
import { TrendingService } from '../services/trending.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadCrumb } from '../../../_models/breadcrumbs.model';

@Component({
  selector: 'trending-form',
  templateUrl: './trending-form.component.html'
})
export class TrendingFormComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  isReadyForProcessing = false;
  target: number;
  isLoading = true;
  errorMessage = 'Unable to process data.';
  groupId: string;

  breadCrumbs = [
    <BreadCrumb>{ name: 'Setup Rules', routerLink: 'Setup' },
    <BreadCrumb>{ name: 'Preview Results', routerLink: 'Summary' }
  ];

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  constructor(
    private processingService: ProcessingService,
    private router: Router,
    private route: ActivatedRoute,
    private trendingService: TrendingService
  ) {}

  ngOnInit() {
    this.processingService.groupId = this.route.parent.snapshot.paramMap.get('groupId');

    this.processingService
      .getProcessingStatus(this.processingService.groupId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        result => {
          this.isReadyForProcessing = result.isReadyForProcessing;
          this.processingService.dataTarget = result.target;

          if (!this.isReadyForProcessing) {
            this.errorMessage = this.processingService.getProcessingErrorMessage(result);
          }
        },
        error => {},
        () => {
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  navigateToImportData(event: any): void {
    event.preventDefault();
    this.router.navigate([`project-profile/${this.processingService.groupId}/DataImport`]);
  }
}
