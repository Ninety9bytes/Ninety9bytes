import { CopyGroupComponent } from './copy-group.component';
import { PortalManagementService } from '../services/portal-management.service';
import { HelperService } from '../../_core/services/helper.service';
import { AlertService } from '../../_core/services/alert.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';
import { ImageDto } from '../../_api/_runtime/dtos/image.dto';

@Component({
  selector: 'setup-image',
  templateUrl: './setup-image.component.html'
})
export class SetupImageComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public imageUrl = '';
  public acceptedFileTypes = ['.png', '.jpeg', '.gif', '.jpg', '.bmp', '.svg', '.apng'];
  public isUploading = false;
  public canRemove = false;
  @Input() group: GroupDto;

  private currentImage: ImageDto;

  constructor(
    private alertService: AlertService,
    private portalManagementService: PortalManagementService
  ) { }

  ngOnInit(): void {
    this.portalManagementService.getPortalImage(this.group.id).subscribe(
      result => {
        this.currentImage = result;
        this.imageUrl = this.currentImage.url;
        this.canRemove = true;
      },
      error => {
        // do nothing
      }
    );
  }

  ngOnDestroy(): void {

  }

  public uploadFile(file: File) {
    this.isUploading = true;
    this.portalManagementService.upsertPortalImage(this.group.id, file.name, file).subscribe(
      res => {
        this.isUploading = false;
        this.canRemove = true;
        this.currentImage = res;
        this.imageUrl = res.url;
      }
    );
  }

  public removeImage() {
    if (this.canRemove) {
      this.portalManagementService.removePortalImage(this.currentImage.id).subscribe(
        res => {
          this.canRemove = false;
          this.currentImage = null;
          this.imageUrl = '';
        }
      );
    }
  }
}
