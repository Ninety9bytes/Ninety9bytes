import { MassMatchService } from '../../services/mass-match/mass-match.service';
import { HelperService } from '../../../_core/services/helper.service';
import { Component, OnInit, ComponentRef } from '@angular/core';
import { FieldMetaDataDto } from '../../../_api/_configuration/dtos/field-metadata.dto';
import { FieldMatchDto } from '../../../_api/dtos/inventory/field-match.dto';
import { DataTargetName } from '../../../_enums/data-target-name';
import { FieldMatchTermDto } from '../../../_api/dtos/inventory/field-match-term.dto';

@Component({
  selector: 'field-matches',
  templateUrl: './field-matches.component.html'
})
export class FieldMatchesComponent implements OnInit {
  // Setting unique form field names
  formFieldNames = {
    leftTerm: 'leftTerm' + this.helperService.generateGuid(),
    rightTerm: 'rightTerm' + this.helperService.generateGuid()
  };

  inventoryMetadata: Array<Array<FieldMetaDataDto>> = Array<Array<FieldMetaDataDto>>();

  ref: ComponentRef<FieldMatchesComponent>;

  fieldMatch: FieldMatchDto;
  dataTargetNames = DataTargetName;

  constructor(private massMatchService: MassMatchService, private helperService: HelperService) {}

  ngOnInit() {
    this.massMatchService.inventoryMetadata$.subscribe(inventoryMetadata => {
      if (inventoryMetadata) {
        this.inventoryMetadata = inventoryMetadata;
      }
    });

    if (!this.fieldMatch) {
      this.fieldMatch = <FieldMatchDto>{
        leftTerm: <FieldMatchTermDto>{},
        rightTerm: <FieldMatchTermDto>{},
        operation: 'eq',
        isNullOk: false
      };
      this.fieldMatch.id = this.helperService.generateGuid();
      this.fieldMatch.leftTerm.dataTarget = DataTargetName.client;
      this.fieldMatch.rightTerm.dataTarget = DataTargetName.inventory;
    }
  }

  remove() {
    this.massMatchService.removeFieldMatch(this.fieldMatch);

    this.ref.destroy();
  }

  fieldMatchChange() {
    this.massMatchService.addOrUpdateFieldMatch(this.fieldMatch);
  }
}
