import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { CreateImageResponseDto } from '../dtos/create-image-response.dto';
import { Observable } from 'rxjs';
import { CreateImageDto } from '../dtos/create-image.dto';
import { ImageDto } from '../dtos/image.dto';

@Injectable()
export class ImageApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) { }

  // POST /api/image/asset/{assetId}
  public createAssetImage(dto: CreateImageDto): Observable<CreateImageResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/image/asset/${dto.id}?imageName=${dto.imageName}`, null, dto.file);
  }

  // POST /api/image/building/{buildingId}
  public createBuildingImage(dto: CreateImageDto): Observable<CreateImageResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/image/building/${dto.id}?imageName=${dto.imageName}`, null, dto.file);
  }

  // DELETE /api/image/{imageId}
  public deleteImage(id: string): Observable<boolean> {
    return this.apiService.delete(`${this.runtimeEndpoint}/image/${id}`);
  }

  // GET /api/image/{imageId}
  public getImage(id: string): Observable<ImageDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/image/${id}`);
  }

  // PUT /api/image/asset/{assetId}
  public updateAssetImages(assetId: string, imageArr: Array<ImageDto>): Observable<Array<ImageDto>> {
    return this.apiService.put(`${this.runtimeEndpoint}/image/asset/${assetId}`, imageArr);
  }

  // PUT /api/image/building/{buildingId}
  public updateBuildingImages(buildingId: string, imageArr: Array<ImageDto>): Observable<Array<ImageDto>> {
    return this.apiService.put(`${this.runtimeEndpoint}/image/building/${buildingId}`, imageArr);
  }

  // POST /api/image/group/{groupId}
  public upsertPortalImage(portalId: string, imageName: string, file: File): Observable<ImageDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/image/group/${portalId}?imageName=${imageName}`, null, file);
  }

  // GET /api/image/portal/{groupId}
  public getPortalImage(portalId: string): Observable<ImageDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/image/portal/${portalId}`, null, true);
  }
}
