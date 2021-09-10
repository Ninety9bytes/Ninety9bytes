import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef, Renderer2, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { CascadedSelectOption } from '../../../../_models/cascaded-select-option.model';
import { CascadedSelectValue } from '../../../../_models/cascaded-select-value.model';

@Component({
  selector: 'cascading-combo-box',
  templateUrl: './cascading-combo-box.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascadingComboBoxComponent),
      multi: true
    }
  ]
})
export class CascadingComboBoxComponent implements OnInit, ControlValueAccessor, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() options = new Array<CascadedSelectOption>();
  @Input() valuesToSelect = new Array<CascadedSelectValue>();
  @Input() required = false;
  @Output() OnSelectedItemsChange: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  public selectedItems = [];
  public selectedIds: Array<string>;
  public depth = [];

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.selectedItems = [];
  }

  onComboboxChange(index: number, event: any) {
    let selectedValue = '';

    if (event === undefined) {
      this.selectedItems[index] = null;
    } else {
      selectedValue = this.selectedItems.map(c => !!c && c.key).toString();
    }

    // Clear selected items after index
    for (let i = 0; i < this.selectedItems.length; i++) {
      if (i > index) {
        this.selectedItems[i] = null;
      }
    }

    // console.log(selectedValue);

    this.writeValue(selectedValue);
  }

  setRemainingOptions(field: CascadedSelectOption, depth: number): void {
    if (field && field.options) {
      const current = field.options.find(c => !!c && c.key === this.selectedIds[depth]);

      if (current) {
        this.selectedItems.push(current);
      }

      this.setRemainingOptions(current, depth + 1);
    }
  }

  // Angular Forms API Interface Members
  // The Angular Forms API calls this method to write form control value

  onChange = (value: any) => {};

  writeValue(value: string): void {
    this.onChange(value);

    if (this.selectedIds === undefined) {
      this.initialize(value);
    }
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // Required by ControlValueAccessor - DO NOT Remove
  }
  setDisabledState?(isDisabled: boolean): void {}


  private initialize(value: string): void {
    this.selectedIds = new Array<string>();

    if (value && value.indexOf(',') !== -1) {
      this.selectedIds = value.split(',');
    }

    // Setting the first set of options
    if (this.options) {
      const firstSelectOption = this.options.find(f => f && f.key === this.selectedIds[0]);

      if (firstSelectOption) {
        this.selectedItems.push(firstSelectOption);

        // Recursively set the remaining options
        this.setRemainingOptions(firstSelectOption, 1);
      }
    }
  }
}
