import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { CustomDataTypesRepository } from '../../_api/services/custom-data-types-repository.service';
import { SupportedCustomColumnDataTypeDto } from '../../_api/dtos/shared/supported-custom-column-datatype.dto';
import { CreateAssetFileCustomColumnDto } from '../../_api/dtos/create-asset-file-custom-column.dto';

@Component({
  selector: 'add-asset-column-component',
  templateUrl: './add-asset-column-component.html'
})
export class AddAssetColumnComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  constructor(private customDataTypesService: CustomDataTypesRepository) {}

  public isAddColumn = false;
  isNameValid = true;
  isDataTypeValid = true;
  dataType: number;
  name: string;
  nameFieldError: string;

  dataTypes: SupportedCustomColumnDataTypeDto[];
  @Output()
  onColumnAdded = new EventEmitter<CreateAssetFileCustomColumnDto>();
  @Output()
  onFormOpen = new EventEmitter<boolean>();
  @Input()
  knownColumnNames: string[];

  ngOnInit() {
    // console.log(this.dataType, 'AddAssetColumnComponent');

    this.customDataTypesService.getCustomColumnDataTypes().subscribe(res => {
      this.dataTypes = res;
    });
  }

  showForm() {
    this.isAddColumn = true;
    this.name = '';
    this.dataType = -1;
    this.isNameValid = true;
    this.isDataTypeValid = true;
  }

  submit() {
    let isValid = true;
    if (this.name === '') {
      isValid = false;
      this.isNameValid = false;
      this.nameFieldError = 'Field name is required.';
    }
    if (isValid) {
      if (!this.name.match('^[a-zA-Z_$][a-zA-Z_$0-9]*$')) {
        isValid = false;
        this.isNameValid = false;
        this.nameFieldError = 'Custom columns cannot contain spaces or special characters.';
      }
    }
    if (isValid) {
      for (let i = 0; i < this.knownColumnNames.length; i++) {
        if (this.knownColumnNames[i].toLowerCase() === this.name.toLowerCase()) {
          this.isNameValid = false;
          isValid = false;
          this.nameFieldError = 'Field name must be unique.';
          break;
        }
      }
    }

    if (this.dataType === -1) {
      isValid = false;
      this.isDataTypeValid = false;
    }

    if (isValid) {
      this.isAddColumn = false;
      this.onColumnAdded.emit(new CreateAssetFileCustomColumnDto(this.name, this.dataType));
    }
  }
}
