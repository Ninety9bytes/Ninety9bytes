import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { GroupSettingDto } from '../dtos/group-setting.dto';
import { Observable } from 'rxjs';

@Injectable()
export class SettingsApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public create(dto: GroupSettingDto): Observable<GroupSettingDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/GroupSettings`, dto, null, true);
  }

  public update(id: string, dto: GroupSettingDto): Observable<GroupSettingDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Settings/${id}`, dto, true);
  }

  public delete(id: string): Observable<boolean> {
    return this.apiService.delete(`${this.runtimeEndpoint}/Settings/${id}`, true);
  }

  public getSetting(id: string): Observable<GroupSettingDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/group/${id}`, null, true);
  }

  public getSettingsByGroupId(groupId: string) {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/group/${groupId}`, null, true);
  }

  public getSettingsByGroupIdSettingType(groupId: string, settingType: number) {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/group/${groupId}/${settingType}`, null, true);
  }

  public getSettingsByGroupIdUserId(groupId: string, userId: string) {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/group/${groupId}/User/${userId}`, null, true);
  }

  public getSettingsByGroupIdUserIdSettingType(groupId: string, userId: string, settingType: number) {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/group/${groupId}/User/${userId}/${settingType}`, null, true);
  }

  public getSettingsByUserId(userId: string) {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/user/${userId}`, null, true);
  }

  public getSettingsByUserIdSettingType(userId: string, settingType: number) {
    return this.apiService.get(`${this.runtimeEndpoint}/settings/user/${userId}/${settingType}`, null, true);
  }
}
