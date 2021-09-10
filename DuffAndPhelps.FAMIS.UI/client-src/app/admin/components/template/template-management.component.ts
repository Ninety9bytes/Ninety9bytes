import { TemplateService } from '../../services/template.service';
import { AlertService } from '../../../_core/services/alert.service';
import { RowClassArgs, GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { UserGridService } from '../../../_core/services/user-grid.service';
import { Component, OnInit } from '@angular/core';
import { OfficeDto } from '../../../_api/dtos/office.dto';
import { State, CompositeFilterDescriptor, process } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { SetTemplateIsRetiredDto } from '../../../_api/dtos/template-management/set-template-isretired.dto';
import { TemplateBaseDto } from '../../../_api/dtos/template-management/template-base.dto';

@Component({
  selector: 'template-management',
  templateUrl: './template-management.component.html'
})
export class TemplateManagementComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public templatesGridBusy = true;
  public templates: Array<TemplateBaseDto> = new Array<TemplateBaseDto>();
  public offices: Array<OfficeDto> = new Array<OfficeDto>();


  template: TemplateBaseDto;

  state: State = {
    skip: 0,
    take: 50
  };

  public userGridSettingName = this.userGridService.createUserGridId(
    null,
    this.router.url.toString().split('?')[0],
    'Template Management Grid'
  );

  filterRoot = { logic: 'and', filters: [] } as CompositeFilterDescriptor;

  gridData: GridDataResult = process(this.templates, this.state);

  constructor(private templateService: TemplateService,
              private alertService: AlertService,
              private famisGridService: FamisGridService,
              private userGridService: UserGridService,
              private router: Router) {}

  ngOnInit() {
    this.templateService
      .getAll()
      .subscribe(templates => {
        this.userGridService.getSettings(this.famisGridService.userId, this.userGridSettingName, null)
          .subscribe(gridSettings => {
              if (gridSettings.filters && gridSettings.filters.filters && gridSettings.filters.filters.length > 0) {
                this.filterRoot = gridSettings.filters;
                this.state.filter = this.filterRoot;
                this.loadTemplates(templates);
              } else {
                this.loadTemplates(templates);
              }
            });
      },
      error => {}, () => (this.templatesGridBusy = false));

    this.famisGridService.setUserId();
  }

  private loadTemplates(templates: Array<TemplateBaseDto>) {
    this.templates = templates;
    this.refreshGridData();
  }

  handleCopy(sourceId: string, $event) {
    const errors = new Array<string>();
    event.preventDefault();

    const sourceTemplate = this.templates.find(c => c.id === sourceId);

    if (sourceTemplate) {
      this.templateService.clone(sourceTemplate).subscribe(result => {

        if (result === null) {
          errors.push('An error occurred while copying the template.');
        } else {
          this.templates.push(<TemplateBaseDto>result);
          this.refreshGridData();
          this.alertService.success('Template copied successfully!');
        }
      });
    } else {
      errors.push('An error occurred while copying the template.');
    }

    errors.forEach(error => {
      this.alertService.error(error);
    });
  }

  toggleIsRetired(id: string, $event) {
    event.preventDefault();

    const templateIndex = this.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return;
    }
    if (this.templates[templateIndex].isMasterTemplate) {
      this.alertService.error('Cannot retire a master template.');
    }

    if (this.templates) {
      this.templateService.setIsRetired(id, !this.templates[templateIndex].isRetired).subscribe(
        data => this.setIsRetiredState(data),
        error => {
          this.alertService.error('This isn\'t working yet, remove this message after the route exists.');
          this.templates[0].isRetired = !this.templates[0].isRetired;
        }
      );
    }
  }

  private setIsRetiredState(dto: SetTemplateIsRetiredDto) {
    if (dto == null) {
      return;
    }
    const templateIndex = this.templates.findIndex(t => t.id === dto.templateId);
    if (templateIndex === -1) {
      return;
    }

    this.templates[templateIndex].isRetired = dto.isRetired;
  }

  public isDisabled(context: RowClassArgs) {
    return context.dataItem.isRetired ? 'disabled-row' : 'enabled-row';
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.templates, this.state);
  }

  private refreshGridData() {
    this.gridData = process(this.templates, this.state);
  }

  public handleFilterChange(filter: any): void {
    // save the filter
    this.filterRoot = filter;
    this.userGridService.saveSettings(this.userGridSettingName, null,
    null, this.famisGridService.userId, null, this.filterRoot).subscribe();
  }
}
