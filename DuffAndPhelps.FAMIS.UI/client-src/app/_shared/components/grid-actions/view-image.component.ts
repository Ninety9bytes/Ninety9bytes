import { CarouselModalComponent } from '../carousel-modal.component';
import { HelperService } from '../../../_core/services/helper.service';
import { ImageService } from '../../../_core/services/image.service';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { ImageDto } from '../../../_api/_runtime/dtos/image.dto';
import { WindowOption } from '../../../_models/window-option';

@Component({
  selector: 'view-image',
  templateUrl: './view-image.component.html'
})
export class ViewImageComponent implements OnInit {
  @Input()
  imageCollection = new Array<ImageDto>();

  public firstImage: ImageDto;

  constructor(private windowManager: WindowManager, public container: ViewContainerRef, private imageService: ImageService) {}

  ngOnInit() {
    this.imageCollection.sort(this.imageService.compareImageIndexes);
  }

  showImageCarouselOnClick() {
    const imageUrlCollection = new Array<string>();

    this.imageCollection.forEach(image => {
      imageUrlCollection.push(image.url);
    });

    const modal = this.windowManager.open(CarouselModalComponent, 'Images', <WindowOption>{
      isModal: true
    });

    modal.content.instance.hideSubmit = true;
    modal.content.instance.imageUrlCollection = imageUrlCollection;
  }
}
