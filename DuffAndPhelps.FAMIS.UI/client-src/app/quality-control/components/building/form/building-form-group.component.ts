import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { ImageEntityType } from '../../../../_api/_runtime/enums/image-entity-type';
import { Input, OnInit, Component, Output, EventEmitter } from '@angular/core';
import { FieldType } from '../../../../_enums/field-type';
import { formLayout } from '../../../../_models/form-layout.model';
import { FieldMetaDataDto } from '../../../../_api/dtos/inventory/field-meta-data.dto';

@Component({
  selector: 'building-form-group',
  templateUrl: './building-form-group.component.html'
})
export class BuildingFormGroupComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  fieldTypes = FieldType;

  fieldsLeft = [];
  fieldsRight = [];

  @Input() formControls: any;
  @Input() formGroup: any;
  @Input() formLayout: formLayout;
  @Input() buildingId: string;
  @Output() customFieldLabelChange: EventEmitter<FieldMetaDataDto> = new EventEmitter();
  imageEntityTypes = ImageEntityType;

  constructor() {}

  ngOnInit(): void {
    if (this.formLayout) {
      let s = this;
      this.fieldsLeft = this.mapOrder(
        this.formControls.filter(function(x: { id: string }) {
          return s.formLayout.left.findIndex(c => c === x.id) !== -1;
        }),
        this.formLayout.left,
        'id'
      );
      this.fieldsRight = this.mapOrder(
        this.formControls.filter(function(x: { id: string }) {
          return s.formLayout.right.findIndex(c => c === x.id) !== -1;
        }),
        this.formLayout.right,
        'id'
      );
    }
  }

  private mapOrder(array, order, key) {
    array.sort(function(a, b) {
      const A = a[key],
        B = b[key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });

    return array;
  }

  public handleCustomFieldLabelChange(field: FieldMetaDataDto) {
    this.customFieldLabelChange.emit(field);
  }
}
