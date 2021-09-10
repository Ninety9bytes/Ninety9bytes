import { ReplaceFieldModes } from '../../_enums/replace-field-modes';
import * as mjs from 'mathjs';
import { FieldType } from '../../_api/_runtime/enums/field-type';
import { HelperService } from '../../_core/services/helper.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, ViewChild, OnInit, ElementRef, Input, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { ReplaceFieldSelectionOption, ReplaceFieldSelectionInfo } from '../../_models/shared/replace-field-selection-info.model';
import { MassUpdateRequestAdvancedTermDto } from '../../_api/_runtime/dtos/mass-update-request-advanced-term.dto';
import { NgForm } from '@angular/forms';
import { ReplaceField } from '../../_models/replace-field-state.model';
import { FieldMetaDataDto } from '../../_api/_runtime/dtos/field-meta-data.dto';

@Component({
  selector: 'replace-field',
  templateUrl: './replace-field.component.html'
})
export class ReplaceFieldComponent implements OnInit, AfterViewInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('replaceValue', { static: false }) replaceValue: ElementRef;

  public replaceFieldModes = ReplaceFieldModes;
  public mode: ReplaceFieldModes = ReplaceFieldModes.Text;
  public fieldTypes = FieldType;
  public currentSelectionOptions: Array<ReplaceFieldSelectionOption>;
  private loadedCollection: Array<FieldMetaDataDto>;

  @Input()
  state: ReplaceField = <ReplaceField>{
    isAdvanced: false,
    replacementField: '',
    replacementValue: null,
    advancedReplacementValue: <MassUpdateRequestAdvancedTermDto>{},
    advancedReplacementHtml: '',
  };

  @Input() form: NgForm;

  @Input() supportsAdvancedReplace = false;

  @Input() isAdvanced = false;

  @Input() translatedBaseKey: string;

  @Input() selectionFieldInfo: ReplaceFieldSelectionInfo[];

  @Output() modelChanged = new EventEmitter<ReplaceField>();

  constructor(private helperSerivce: HelperService) {}

  ngOnInit() {
    this.mode = this.isAdvanced ? ReplaceFieldModes.Advanced : this.replaceFieldModes.Text;
    this.state.isAdvanced = this.isAdvanced;
    if (!this.state.replacementValue) {
      this.state.replacementValue = null;
    }
    this.updateModel();
  }

  ngAfterViewInit() {
    if (this.replaceValue) {
      this.replaceValue.nativeElement.innerHTML = this.state.advancedReplacementHtml;
    }
  }

  updateModel() {
    if (!this.state.replacementValue) {
      if (this.mode === this.replaceFieldModes.Advanced) {
        this.state.replacementValue = null;
        this.state.advancedReplacementHtml = null;
      } else if (this.mode === this.replaceFieldModes.Text) {
        this.state.replacementValue = null;
        this.state.advancedReplacementHtml = null;
        this.state.advancedReplacementValue = null;
      }
    }
    this.modelChanged.emit(this.state);
  }

  updateAdvancedModel() {
    this.state.replacementValue = this.replaceValue.nativeElement.innerText;
    this.state.advancedReplacementHtml = this.replaceValue.nativeElement.innerHTML;
    this.state.advancedReplacementValue = this.helperSerivce.convertMathTree(
      mjs.parse(this.state.replacementValue.replace(new RegExp(String.fromCharCode(160), 'g'), ' '))
    );
    this.updateModel();
  }

  validateAdvancedReplacement(event: any) {
    if (this.mode === this.replaceFieldModes.Advanced) {
      const pattern = /[0-9()+\-*/. ]/;
      const keys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (!pattern.test(event.key) && keys.indexOf(event.key) < 0) {
        event.preventDefault();
      }
    }
  }

  insertAdvancedField(field: string) {
    this.replaceValue.nativeElement.innerHTML
      += '<span contenteditable=\'false\' style=\'background-color:lightgray; display: inline-block;\'>' + field + '</span>&nbsp;';

    this.updateAdvancedModel();
  }

  toggleAdvancedMode(mode: ReplaceFieldModes) {
    this.mode = mode;

    this.state.isAdvanced = this.mode === this.replaceFieldModes.Advanced ? true : false;
    this.state.replacementValue = null;
    this.state.replacementField = '';
    this.state.advancedReplacementValue = null;
    if (this.replaceValue) {
      this.replaceValue.nativeElement.innerText = '';
    }

    if (!this.loadedCollection) {
      this.loadedCollection = this.state.collection;
    }

    if (mode === this.replaceFieldModes.Advanced) {
      this.state.collection = this.loadedCollection.filter(
        x => x.fieldType === this.fieldTypes.Double || x.fieldType === this.fieldTypes.Integer
      );
    } else {
      this.state.collection = this.loadedCollection;
    }
    this.updateModel();
  }

  checkFieldIsDate(field: string): boolean {
    if (this.state.collection) {
      return this.state.collection.find(c => c.name === field).fieldType === FieldType.DateTime;
    } else {
      return false;
    }
  }

  checkFieldIsSelection(field: string): boolean {
    if (this.state.collection && this.selectionFieldInfo) {
      const infoSet = this.selectionFieldInfo.find(c => c.fieldNames.indexOf(field) !== -1);
      if (infoSet) {
        this.currentSelectionOptions = infoSet.values;
        return true;
      }
    } else {
      return false;
    }
  }
}
