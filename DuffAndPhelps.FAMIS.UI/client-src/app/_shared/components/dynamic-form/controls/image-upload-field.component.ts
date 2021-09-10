import { CarouselModalComponent } from '../../carousel-modal.component';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { ImageService } from '../../../../_core/services/image.service';
import { WindowManager } from '../../../../_core/services/window-manager.service';
import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { ImageEntityType } from '../../../../_api/_runtime/enums/image-entity-type';
import { CreateImageDto } from '../../../../_api/_runtime/dtos/create-image.dto';
import { ImageDto } from '../../../../_api/_runtime/dtos/image.dto';
import { ImageApiService } from '../../../../_api/_runtime/services/image-api.service';
import { InsuranceApiService } from '../../../../_api/_runtime/services/insurance-api.service';
import { InventoryApiService } from '../../../../_api/_runtime/services/inventory-api.service';
import { WindowOption } from '../../../../_models/window-option';

@Component({
  selector: 'image-upload-field',
  templateUrl: './image-upload-field.component.html'
})
export class ImageUploadFieldComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() entityId: string;
  @Input() imageEntityType: ImageEntityType;

  uploadImageDto = <CreateImageDto>{ file: null, imageName: '' };
  images: Array<ImageDto> = new Array<ImageDto>();
  disabled: boolean;

  constructor(
    private imageApiService: ImageApiService,
    private InventoryApiService: InventoryApiService,
    private insuranceApiService: InsuranceApiService,
    private windowManager: WindowManager,
    private container: ViewContainerRef,
    private imageService: ImageService
    ) { }

  ngOnInit() {
    if (this.entityId) {
      this.uploadImageDto.id = this.entityId;
      this.updateImages();
    } else {
      this.disabled = true;
    }
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.uploadImageDto.file = fileList[0];
      this.uploadImageDto.imageName = fileList[0].name;
    }
  }

  upload() {
    this.uploadImageDto.index = this.images.length;

    if (this.imageEntityType === 0) {
      this.imageApiService.createAssetImage(this.uploadImageDto).subscribe(() => {
        this.updateImages();
      });
    } else {
      this.imageApiService.createBuildingImage(this.uploadImageDto).subscribe(() => {
        this.updateImages();
      });
    }
  }

  updateImages() {
    if (this.imageEntityType === 0) {
      this.InventoryApiService.getAssetRecord(this.entityId).subscribe(dto => {
        if (dto.assetImages) {
          this.images = dto.assetImages.sort(this.imageService.compareImageIndexes);
          this.imageService.imageCollection = this.images;
        }
      });
    } else {
      this.insuranceApiService.getBuilding(this.entityId).subscribe(dto => {
        if (dto.buildingImages) {
          this.images = dto.buildingImages.sort(this.imageService.compareImageIndexes);
          this.imageService.imageCollection = this.images;
        }
      });
    }
  }

  delete(image: ImageDto) {
    this.imageApiService.deleteImage(image.id).subscribe(() => {
      this.images = this.images.filter((img) => {
        return img.index !== image.index;
      });
      this.imageService.imageCollection = this.images;
    });
  }

  onInputBlur(event: Event, imageIndex: number) {
    const inputValue = Number((<HTMLInputElement>event.target).value);

    if (inputValue !== this.images[imageIndex].index) {
      const editedImageIndex: number = this.images[imageIndex].index;

      for (let i = 0; i < this.images.length; i++) {
        if (this.images[i].index === inputValue) {

          this.images[i].index = this.images[imageIndex].index;
          this.images[imageIndex].index = this.images[i].index;

          break;
        }
      }

      if (this.images[imageIndex].index === editedImageIndex) {
        this.images[imageIndex].index = inputValue;
      }

      this.images.sort(this.imageService.compareImageIndexes);
      this.imageService.imageCollection = this.images;

    }
  }

  showImageCarouselOnClick(imageUrl: string) {
    let imageUrlCollection = new Array<string>();

    this.images.forEach((image) => {
      imageUrlCollection.push(image.url);
    });

    imageUrlCollection = imageUrlCollection.filter((url) => {
      return url !== imageUrl;
    });
    imageUrlCollection.unshift(imageUrl);


    const modal = this.windowManager.open(CarouselModalComponent, 'Images', <WindowOption>{
      isModal: true
    });

    modal.content.instance.hideSubmit = true;
    modal.content.instance.imageUrlCollection = imageUrlCollection;
  }

}
