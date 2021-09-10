import { Injectable } from '@angular/core';
import { ImageDto } from '../../_api/_runtime/dtos/image.dto';

@Injectable()
export class ImageService {
  public imageCollection = new Array<ImageDto>();

  constructor() { }

  public compareImageIndexes(firstValue: ImageDto, nextValue: ImageDto): number {
    if (firstValue.index < nextValue.index) { return -1; }
    if (firstValue.index > nextValue.index) { return 1; }
    return 0;
  }
}
