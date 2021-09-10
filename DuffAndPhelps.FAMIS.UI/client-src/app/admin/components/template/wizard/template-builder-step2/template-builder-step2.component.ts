import { TemplateService } from '../../../../services/template.service';

import { TranslatedComponent } from '../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../_core/i18n/translation-base-keys';
import { OnChanges, Component, OnInit, Input, ViewChild, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { TemplateFieldBaseDto } from '../../../../../_api/dtos/template-management/template-field-base.dto';
import { TemplateBaseDto } from '../../../../../_api/dtos/template-management/template-base.dto';
import { ModuleDto } from '../../../../../_api/dtos/module.dto';
import { NgForm } from '@angular/forms';
import { TemplateUpdateEvent } from '../../../../../_models/events/template-update-event.model';
import { WizardService } from '../../../../../_ui/services/wizard.service';

@Component({
  selector: 'app-template-builder-step2',
  templateUrl: './template-builder-step2.component.html'
})
export class TemplateBuilderStep2Component implements OnChanges, OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  errors: Object = {};
  isSubmitting = false;
  customFields: Array<TemplateFieldBaseDto> = new Array<TemplateFieldBaseDto>();
  selectedModuleFieldIds = new Array<string>();

  validCustomFields: Boolean = true;
  invalidCustomFieldDataTypes: Array<string> = new Array<string>();
  invalidCustomFieldNames: Array<[string, string]> = new Array<[string, string]>();

  @Input() template: TemplateBaseDto;
  @Input() modules: Array<ModuleDto>;
  @Input() selectedModules: Array<ModuleDto>;

  @ViewChild('dataImportForm', { static: true }) currentForm: NgForm;

  @Output() templateUpdated = new EventEmitter<TemplateUpdateEvent>();
  isEdit: boolean;
  constructor(private templateService: TemplateService, private wizardService: WizardService) {}

  ngOnInit(): void {
    this.currentForm.valueChanges.subscribe(() => {
      this.templateService.templateFormDirty = this.currentForm.dirty;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isEdit = this.template.id !== undefined;

    if (changes.selectedModules) {
      const selectedModules = <Array<ModuleDto>>changes.selectedModules.currentValue;

      this.selectedModules.forEach(selectedModule => {
        const fields = this.template.templateFields
          .filter(c => c.moduleId === selectedModule.id && !c.isCustomField)
          .map(obj => obj.moduleFieldId);

        if (fields) {
          this.selectedModuleFieldIds[selectedModule.id] = fields;
        }

        // console.log(this.selectedModuleFieldIds);
      });
    }

    // Init Custom Fields
    this.template.templateFields.forEach(field => {
      if (field.isCustomField) {
        this.customFields.push(field);
      }
    });
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      // TODO: This is to prevent the cancel button from being clicked on 'enter pressed'
      event.preventDefault();
    }
  }

  onSubmit(form) {
    if (form.valid && this.validateCustomFields(true)) {
      const selectedTemplateFields = new Array<TemplateFieldBaseDto>();

      this.selectedModules.forEach(module => {
        const enableOnlyModuleFields = module.moduleFields.filter(c => c.dataType === 'Module');

        enableOnlyModuleFields.forEach(field => {
          const enableOnlyField = <TemplateFieldBaseDto>{
            id: field.id,
            moduleId: field.moduleId,
            name: field.name,
            fieldType: field.dataType,
            isRequired: field.isRequired,
            order: field.order,
            isCustomField: false,
            moduleFieldId: field.id
          };

          selectedTemplateFields.push(enableOnlyField);
        });

        this.selectedModuleFieldIds[module.id].forEach(option => {
          const matchedField = module.moduleFields.find(c => c.id === option);

          if (matchedField) {
            selectedTemplateFields.push(this.templateService.mapTemplateField(matchedField, module.id));
          }
        });

        // Adding custom fields
        this.customFields.forEach(field => {
          if (field.moduleId === module.id) {
            selectedTemplateFields.push(field);
          }
        });
      });

      const event = <TemplateUpdateEvent>{ templateFields: selectedTemplateFields };

      this.templateUpdated.emit(event);

      this.wizardService.setActiveTab('step-3');
    }
  }

  addCustomField(fields: Array<TemplateFieldBaseDto>) {
    if (fields.length > 0) {
      fields.forEach(field => {
        const current = this.customFields.find(c => c.id === field.id);
        const index = this.customFields.indexOf(current);

        if (index === -1) {
          this.customFields.push(field);
        } else {
          this.customFields[index] = field;
        }
      });
      this.validateCustomFields(false);
    }
  }

  navigateBack(event) {
    event.preventDefault();
    this.wizardService.setActiveTab('step-1');
  }

  removeCustomField(fieldId: string) {
    if (fieldId) {
      const index = this.customFields.findIndex(i => i.id === fieldId);
      if (index !== -1) { this.customFields.splice(index, 1); }
    }
  }

  isModuleOnly(module: ModuleDto) {
    return module.moduleFields.some(c => c.dataType === 'Module');
  }

  private validateCustomFields(isSubmission: boolean): Boolean {
    const invalidDataTypeIndexes = new Array<string>();
    const invalidNameIndexes = new Array<[string, string]>();

    for (let i = 0; i < this.customFields.length; i++) {
      const field = this.customFields[i];

      if (field.fieldType === '' && isSubmission) {
        invalidDataTypeIndexes.push(field.id);
      }

      if (isSubmission) {
        let errors = '';
        if (field.name === '') {
          errors = 'Name is required.';
        }
        if (!this.isFieldNameUnique(field)) {
          errors = 'Name must be unique.';
        }
        if (errors !== '') {
          invalidNameIndexes.push([field.id, errors]);
        }
      }

      if (this.invalidCustomFieldDataTypes.findIndex(a => a === field.id) !== -1 && !isSubmission) {
        if (field.fieldType === '') {
          invalidDataTypeIndexes.push(field.id);
        }
      }

      if (this.invalidCustomFieldNames.findIndex(tuple => tuple[0] === field.id) !== -1 && !isSubmission) {
        if (field.name === '') {
          invalidNameIndexes.push([field.id, 'Name is required.']);
        } else if (!this.isFieldNameUnique(field)) {
          invalidNameIndexes.push([field.id, 'Name must be unique.']);
        }
      }
    }
    this.invalidCustomFieldDataTypes = invalidDataTypeIndexes;
    this.invalidCustomFieldNames = invalidNameIndexes;
    this.validCustomFields = this.invalidCustomFieldDataTypes.length === 0 && this.invalidCustomFieldNames.length === 0;
    return this.validCustomFields;
  }

  private isFieldNameUnique(field: TemplateFieldBaseDto): boolean {
    let isUnique = true;
    const _module = this.modules.find(m => m.id === field.moduleId);

    // Check Module's fields for uniqueness
    for (let i = 0; i < _module.moduleFields.length; ++i) {
        if (_module.moduleFields[i].name.toLowerCase().trim().replace(/ /g, '') === field.name.toLowerCase().trim().replace(/ /g, '')) {
        return isUnique = false;
      }
    }


    const fieldIndex = this.customFields.findIndex(i => i.id === field.id);
    // Check custom field names
    if (this.customFields && this.customFields.length > 0) {
      for (let i = 0; i < this.customFields.length; i++) {
        if (this.customFields[i].moduleId !== field.moduleId) { continue; }

        if (this.customFields[i].id !== field.id) {
          if (this.customFields[i].name === field.name && i < fieldIndex) {
            isUnique = false;
            break;
          }
          if (this.customFields[i].name.trim().replace(/ /g, '') === field.name.trim().replace(/ /g, '')) {
            isUnique = false;
            break;
          }
        }
      }
    }
    return isUnique;
  }
}
