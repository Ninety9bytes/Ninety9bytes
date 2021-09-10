import { AlertService } from '../../_core/services/alert.service';
import { ProjectProfileService } from '../services/project-profile.service';
import { HelperService } from '../../_core/services/helper.service';
import { ComponentCanDeactivate } from '../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { UserStore } from '../../_core/user/user.store';
import { SystemPermissionsEnum } from '../../_core/user/permissions';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormView } from '../../_models/form-view';
import { BaseField } from '../../_models/field-types/base-field.model';
import { ProjectModuleDto } from '../../_api/dtos/project-module.dto';
import { ProjectProfile } from '../../_models/project-profile.model';
import { ProjectProfileAPIService } from '../../_api/services/project-profile/project-profile-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectProfileControlService } from '../../_api/services/project-profile/project-profile-control.service';
import { IntlService } from '@progress/kendo-angular-intl';
import { ModuleFieldDropdownDto, ModuleFieldDropdownItemDto } from '../../_api/dtos/project-profile/module-field-dropdown.dto';
import { DropDownField } from '../../_models/field-types/drop-down-field.model';
import { ModuleFieldTextDto } from '../../_api/dtos/project-profile/module-field-text.dto';
import { MultiLineTextField } from '../../_models/field-types/multi-line-text-field.model';
import { TextField } from '../../_models/field-types/text-field.model';
import { ModuleFieldDateDto } from '../../_api/dtos/project-profile/module-field-date.dto';
import { DateField } from '../../_models/field-types/date-field.model';
import { ModuleFieldDecimalNumberDto } from '../../_api/dtos/project-profile/module-field-decimal-number.dto';
import { DecimalField } from '../../_models/field-types/decimal-field.model';
import { ModuleFieldWholeNumberDto } from '../../_api/dtos/project-profile/module-field-whole-number.dto';
import { ModuleFieldBooleanDto } from '../../_api/dtos/project-profile/module-field-boolean.dto';
import { BooleanField } from '../../_models/field-types/boolean-field.model';
import { WholeNumberField } from '../../_models/field-types/whole-number-field.model';
import { ModuleFieldPeoplePickerDto } from '../../_api/dtos/project-profile/module-field-people-picker.dto';
import { PeoplePickerField } from '../../_models/field-types/people-picker-field.model';
import { ModuleFieldBaseDto } from '../../_api/dtos/project-profile/module-field-base.dto';
import { PeoplePickerSearchResultDto } from '../../_api/dtos/project-profile/people-picker-search-result.dto';
import { FamisViewModelDto } from '../../_api/dtos/project-profile/famis-view-model.dto';

@Component({
  selector: 'template-form',
  templateUrl: './template-form.component.html'
})
export class TemplateFormComponent extends ComponentCanDeactivate implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('currentForm', {static: true})
  currentForm: NgForm;
  view: FormView = {
    id: '',
    groupId: '',
    name: '',
    evenFields: new Array<BaseField<any>>(),
    oddFields: new Array<BaseField<any>>()
  };
  forms: FormView[] = new Array<FormView>();

  public moduleName: string;
  public moduleRouteName: string;
  public canManageTemplates = false;
  private moduleDto: FamisViewModelDto;
  private moduleId: string;
  private selectedModule: ProjectModuleDto;

  private projectProfile: ProjectProfile;

  constructor(
    private apiService: ProjectProfileAPIService,
    private projectProfileService: ProjectProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private projectProfileControlService: ProjectProfileControlService,
    private alertService: AlertService,
    private helperService: HelperService,
    private intl: IntlService,
    private canDeactivateService: CanDeactivateService,
    private userStore: UserStore
  ) {
    super();
  }

  ngOnInit() {
    this.userStore.user.subscribe(user => {
      this.canManageTemplates = user.permissions.permissionsGranted.indexOf(SystemPermissionsEnum.canManageTemplates) > -1;
    });
    this.projectProfileService.projectProfile$.subscribe(projectProfile => {
      this.projectProfile = projectProfile;

      this.moduleName = projectProfile.selectedModule === 'MainProfile' ? 'Main Profile' : 'Sub-Profile';

      this.renderProjectProfile(this.projectProfile.selectedModule);
    });

    this.route.params.subscribe(params => {
      const moduleId = params['moduleId'];

      const projectProfile = <ProjectProfile>{
        selectedGroupId: this.projectProfile.selectedGroupId,
        selectedModule: moduleId,
        template: this.projectProfile.template
      };

      this.projectProfileService.updateProjectProfile(projectProfile);
    });
  }

  renderProjectProfile(moduleId: string) {
    if (this.projectProfile.selectedGroupId && this.projectProfile.selectedModule) {
      this.apiService.get(moduleId, this.projectProfile.selectedGroupId).subscribe(data => {
        if (data == null) {
          return;
        }

        this.initForm(data, moduleId);
      });
    }
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateForm(this.currentForm);
  }

  public initForm(data: FamisViewModelDto, moduleId: string) {
    const fields = new Array<BaseField<any>>();
    data.fields.forEach(field => {
      switch (field.type) {
        case 'DropDown':
          const dropdownFieldDto = field as ModuleFieldDropdownDto;
          fields.push(
            new DropDownField({
              key: dropdownFieldDto.templateFieldId,
              controlType: dropdownFieldDto.type,
              templateFieldId: dropdownFieldDto.templateFieldId,
              fieldName: dropdownFieldDto.fieldName,
              moduleId: dropdownFieldDto.moduleId,
              label: dropdownFieldDto.fieldLabel,
              order: dropdownFieldDto.order + 1,
              isCustomField: dropdownFieldDto.isCustomField,
              dropDownOptions: this.getOptions(dropdownFieldDto.values),
              value: dropdownFieldDto.value != null ? dropdownFieldDto.value.value : ''
            })
          );
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        case 'TextField':
          const textFieldDto = field as ModuleFieldTextDto;
          if (textFieldDto.isMultiline) {
            fields.push(
              new MultiLineTextField({
                key: textFieldDto.templateFieldId,
                templateFieldId: textFieldDto.templateFieldId,
                fieldName: textFieldDto.fieldName,
                moduleId: textFieldDto.moduleId,
                label: textFieldDto.fieldLabel,
                isCustomField: textFieldDto.isCustomField,
                order: textFieldDto.order + 1,
                value: textFieldDto.value
              })
            );
          } else {
            fields.push(
              new TextField({
                key: textFieldDto.templateFieldId,
                controlType: textFieldDto.type,
                templateFieldId: textFieldDto.templateFieldId,
                fieldName: textFieldDto.fieldName,
                moduleId: textFieldDto.moduleId,
                isCustomField: textFieldDto.isCustomField,
                label: textFieldDto.fieldLabel,
                order: textFieldDto.order + 1,
                value: textFieldDto.value
              })
            );
          }
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        case 'Date':
          const dateFieldDto = field as ModuleFieldDateDto;  
          fields.push(
            new DateField({
              key: dateFieldDto.templateFieldId,
              controlType: dateFieldDto.type,
              templateFieldId: dateFieldDto.templateFieldId,
              fieldName: dateFieldDto.fieldName,
              moduleId: dateFieldDto.moduleId,
              label: dateFieldDto.fieldLabel,
              isCustomField: dateFieldDto.isCustomField,
              order: dateFieldDto.order + 1,
              value: Date.parse(dateFieldDto.value) > Date.parse('1/1/1') ?  new Date(this.intl.parseDate(dateFieldDto.value).setHours(0,0,0,0)): null
            })
          );        
       if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        case 'DecimalNumber':
          const decimalFieldDto = field as ModuleFieldDecimalNumberDto;
          fields.push(
            new DecimalField({
              controlType: decimalFieldDto.type,
              templateFieldId: decimalFieldDto.templateFieldId,
              fieldName: decimalFieldDto.fieldName,
              moduleId: decimalFieldDto.moduleId,
              label: decimalFieldDto.fieldLabel,
              isCustomField: decimalFieldDto.isCustomField,
              order: decimalFieldDto.order + 1,
              value: decimalFieldDto.value,
              key: decimalFieldDto.templateFieldId
            })
          );
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        case 'WholeNumber':
          const wholeNumberFieldDto = field as ModuleFieldWholeNumberDto;
          fields.push(
            new WholeNumberField({
              controlType: wholeNumberFieldDto.type,
              templateFieldId: wholeNumberFieldDto.templateFieldId,
              fieldName: wholeNumberFieldDto.fieldName,
              moduleId: wholeNumberFieldDto.moduleId,
              label: wholeNumberFieldDto.fieldLabel,
              isCustomField: wholeNumberFieldDto.isCustomField,
              order: wholeNumberFieldDto.order + 1,
              value: wholeNumberFieldDto.value,
              key: wholeNumberFieldDto.templateFieldId,
            })
          );
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        case 'Boolean':
          const booleanFieldDto = field as ModuleFieldBooleanDto;
          fields.push(
            new BooleanField({
              controlType: booleanFieldDto.type,
              templateFieldId: booleanFieldDto.templateFieldId,
              fieldName: booleanFieldDto.fieldName,
              moduleId: booleanFieldDto.moduleId,
              label: booleanFieldDto.fieldLabel,
              isCustomField: booleanFieldDto.isCustomField,
              order: booleanFieldDto.order + 1,
              value: booleanFieldDto.value,
              key: booleanFieldDto.templateFieldId
            })
          );
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        case 'PeoplePicker':
          const peoplePickerFieldDto = field as ModuleFieldPeoplePickerDto;
          fields.push(
            new PeoplePickerField({
              controlType: peoplePickerFieldDto.type,
              templateFieldId: peoplePickerFieldDto.templateFieldId,
              fieldName: peoplePickerFieldDto.fieldName,
              moduleId: peoplePickerFieldDto.moduleId,
              label: peoplePickerFieldDto.fieldLabel,
              order: peoplePickerFieldDto.order + 1,
              value: peoplePickerFieldDto.key,
              displayValue: peoplePickerFieldDto.value,
              key: peoplePickerFieldDto.templateFieldId
            })
          );
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
          break;
        default:
          const defaultField = field as ModuleFieldTextDto;
          fields.push(
            new TextField({
              key: defaultField.templateFieldId,
              controlType: defaultField.type,
              templateFieldId: defaultField.templateFieldId,
              fieldName: defaultField.fieldName,
              isCustomField: defaultField.isCustomField,
              moduleId: defaultField.moduleId,
              label: defaultField.fieldLabel,
              order: defaultField.order + 1,
              value: defaultField.value
            })
          );
          if (!this.moduleId) {
            this.moduleId = field.moduleId;
          }
      }
    });

    this.view = {
      id: moduleId,
      groupId: data.groupId,
      name: data.viewName,
      evenFields: fields.filter(i => i.order % 2 === 0).sort(function(a, b) {
        return a.order - b.order;
      }),
      oddFields: fields.filter(i => i.order % 2 > 0).sort(function(a, b) {
        return a.order - b.order;
      })
    };

    this.moduleDto = <FamisViewModelDto>{};
    this.moduleDto.groupId = data.groupId;
    this.moduleDto.viewName = data.viewName;
    if (this.view.evenFields.length > 0 && !this.forms.find(c => c.id === this.view.id)) {
      this.forms.push(<FormView>{
        id: this.view.id,
        form: this.projectProfileControlService.toFormGroup(this.view.evenFields.concat(this.view.oddFields)),
        evenfields: this.view.evenFields,
        oddFields: this.view.oddFields
      });
    }
  }

  groupManagement() {
    this.router.navigate([`/project-profile/${this.projectProfile.selectedGroupId}/Groups/Management`]);
  }

  editForms() {
    this.router.navigate([`/project-profile/${this.projectProfile.selectedGroupId}/Groups/EditForms`]);
  }

  getOptions(values: any): Array<any> {
    const dropDownOptions: { key: string; value: string }[] = [];

    values.forEach(option => {
      dropDownOptions.push({ key: option.value, value: option.text });
    });

    return dropDownOptions;
  }

  onSubmit(event: any) {
    const currentFormView = this.forms.find(c => c.id === this.view.id);

    if (currentFormView && currentFormView.form && currentFormView.form.controls) {
      const fieldsToUpdate = [];
      const fieldsAsDto = new Array<ModuleFieldBaseDto>();
      
      Object.keys(currentFormView.form.controls).forEach(key => {
        let field = this.view.evenFields.find(i => i.key === key);
        if (!field) {
          field = this.view.oddFields.find(i => i.key === key);
        }
        switch (field.controlType) {
          case 'boolean':
            fieldsAsDto.push(this.mapBooleanField(field as BooleanField, key, currentFormView.form.controls[key].value));
            break;
          case 'date':
            fieldsAsDto.push(this.mapDateField(field as DateField, key, currentFormView.form.controls[key].value));
            break;
          case 'decimalnumber':
            fieldsAsDto.push(this.mapDecimalNumberField(field as DecimalField, key, currentFormView.form.controls[key].value));
            break;
          case 'dropdown':
            fieldsAsDto.push(this.mapDropDownField(field as DropDownField, key, currentFormView.form.controls[key].value));
            break;
          case 'text':
            fieldsAsDto.push(this.mapTextField(field as TextField, key, currentFormView.form.controls[key].value));
            break;
          case 'wholenumber':
            fieldsAsDto.push(this.mapWholeNumberField(field as WholeNumberField, key, currentFormView.form.controls[key].value));
            break;
          case 'peoplePicker':
            fieldsAsDto.push(this.mapPeoplePickerField(field as PeoplePickerField, key, currentFormView.form.controls[key].value));
            break;
          default:
            fieldsAsDto.push(this.mapTextField(field as TextField, key, currentFormView.form.controls[key].value));
            break;
        }
      });

      // console.log(fieldsToUpdate);
      // console.log(fieldsAsDto);
       
      this.moduleDto.fields = fieldsAsDto;

      this.apiService.update(this.projectProfile.selectedModule, this.view.groupId, this.moduleDto).subscribe(res => {
        this.moduleDto = res;
        this.alertService.success('Changes Saved.');
        this.initForm(res, this.projectProfile.selectedModule);
      });
    }
  }

  /* translate(key: string, label: string, i18n = this.i18n, locali18n?: string) {
    return this.translationHelper.translate(key, i18n, label, locali18n);
  }*/

  private mapBooleanField(bf: BooleanField, key: string, value: boolean): ModuleFieldBooleanDto {
    const res = <ModuleFieldBooleanDto>{
      fieldLabel: bf.label,
      fieldName: bf.fieldName,
      templateFieldId: key,
      moduleId: this.moduleId,
      value: value,
      type: 'Boolean'
    };
    return res;
  }

  private mapDateField(df: DateField, key: string, value: string): ModuleFieldDateDto {
    const res = <ModuleFieldDateDto>{
      fieldLabel: df.label,
      fieldName: df.fieldName,
      templateFieldId: key,
      moduleId: this.moduleId,
      value:  Date.parse(value) > Date.parse('1/1/1') ?  new Date(this.intl.parseDate(value).setHours(0,0,0,0)).toDateString(): null,
      type: 'Date'
    };
    return res;
  }

  private mapDecimalNumberField(df: DecimalField, key: string, value: number): ModuleFieldDecimalNumberDto {
    const res = <ModuleFieldDecimalNumberDto>{
      fieldLabel: df.label,
      fieldName: df.fieldName,
      templateFieldId: key,
      moduleId: this.moduleId,
      value: value,
      type: 'DecimalNumber'
    };
    return res;
  }

  private mapDropDownField(dd: DropDownField, key: string, value: string): ModuleFieldDropdownDto {
    const ddValue = dd.dropDownOptions.find(x => x.key === value);
    const ddValues = new Array<ModuleFieldDropdownItemDto>();
    dd.dropDownOptions.forEach(val => {
      ddValues.push(<ModuleFieldDropdownItemDto>{
        value: val.key,
        text: val.value
      });
    });

    const res = <ModuleFieldDropdownDto>{
      fieldName: dd.fieldName,
      values: ddValues,
      templateFieldId: dd.key,
      moduleId: this.moduleId,
      value: ddValue
        ? <ModuleFieldDropdownItemDto>{
            value: ddValue.key,
            text: ddValue.value
          }
        : null,
      type: 'DropDown'
    };
    return res;
  }

  private mapTextField(tf: TextField, key: string, value: string): ModuleFieldTextDto {
    const res = <ModuleFieldTextDto>{
      fieldLabel: tf.label,
      fieldName: tf.fieldName,
      templateFieldId: tf.key,
      moduleId: this.moduleId,
      value: value,
      type: 'TextField'
    };
    return res;
  }

  private mapWholeNumberField(wf: WholeNumberField, key: string, value: number): ModuleFieldWholeNumberDto {
    const res = <ModuleFieldWholeNumberDto>{
      fieldLabel: wf.label,
      fieldName: wf.fieldName,
      templateFieldId: key,
      moduleId: this.moduleId,
      value: value,
      type: 'WholeNumber'
    };
    return res;
  }

  private mapPeoplePickerField(ppf: PeoplePickerField, key: string, value: PeoplePickerSearchResultDto):
  ModuleFieldPeoplePickerDto {
    const res = <ModuleFieldPeoplePickerDto> {
      fieldLabel: ppf.label,
      fieldName: ppf.fieldName,
      templateFieldId: ppf.key,
      moduleId: this.moduleId,
      value: null,
      key: null,
      type: 'PeoplePicker'
    };
    if (value) {
      res.value = value.id;
      res.key = value.id;
    }
    return res;
  }
}
