import { UserStore } from '../user/user.store';
import { SortDescriptor, State, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { Injectable } from '@angular/core';
import { GroupSettingDto } from '../../_api/_runtime/dtos/group-setting.dto';
import { SettingsApiService } from '../../_api/_runtime/services/settings-api.service';
import { Observable } from 'rxjs';
import { SettingType } from '../../_enums/setting-type';

@Injectable()
export class UserGridService {
  private userGrids = new Array<GroupSettingDto>();

  constructor(private settingsApiService: SettingsApiService, private userStore: UserStore) {}

  createUserGridId(id: string, routePath: string, name = ''): string {
    return `${id}${routePath}${name}`;
  }

  getSettings(userId: string, name: string, defaultHeaders: Array<string>): Observable<GridSetting> {
    const s = this;

    return Observable.create(function(observer) {
      s.settingsApiService.getSettingsByUserId(userId).subscribe(
        result => {
          s.userGrids = result;

          const index = s.userGrids.findIndex(c => c.name === name);

          if (index !== -1 && s.userGrids[index].settingJson) {
            observer.next(s.userGrids[index].settingJson);
          } else {
            observer.next(<GridSetting>{ headers: defaultHeaders });
          }
        },
        error => {
          observer.next(<GridSetting>{ headers: defaultHeaders });
        }
      );
    });
  }

  updateUserSettingsCache(userSetting: GroupSettingDto): void {
    const index = this.userGrids.findIndex(c => c.name === name);

    if (index !== -1 && this.userGrids[index].settingJson) {
      this.userGrids[index] = userSetting;
    } else {
      this.userGrids.push(userSetting);
    }
  }

  public saveSettings(
    id: string,
    headers: Array<string>,
    groupId: string,
    userId: string,
    kendoGridState?: State,
    gridFilters?: CompositeFilterDescriptor,
    columnSizes?: Array<ColumnSize>,
    gridSort?: Array<SortDescriptor>
  ): Observable<GroupSettingDto> {
    const index = this.userGrids.findIndex(c => c.name === id);

    const gridSetting =
      <GridSetting>{
        headers: headers,
        kendoGridState: kendoGridState ? kendoGridState : null,
        filters: gridFilters ? gridFilters : null,
        columnSizes: columnSizes ? columnSizes : null,
        gridSort: gridSort ? gridSort : null
      };

    if (index !== -1) {
      const dto = this.userGrids[index];
      dto.settingJson = gridSetting;

      return this.settingsApiService.update(dto.id, dto);
    } else {
      return this.settingsApiService.create(<GroupSettingDto>{
        groupId: groupId,
        userId: userId,
        name: id,
        settingType: SettingType.gridSetting,
        settingJson: gridSetting
      });
    }
  }

  public saveSelectedHeaders(
    gridSettingsName: string,
    headers: Array<string>
  ): Observable<GroupSettingDto> {

    const userSetting = this.getUserGridSetting(gridSettingsName);
    userSetting.settingJson.headers = headers;
    return this.settingsApiService.update(userSetting.id, userSetting);
  }

  public saveColumnSizes(
    gridSettingsName: string,
    columnSizes: Array<ColumnSize>
  ): Observable<GroupSettingDto> {

    const userSetting = this.getUserGridSetting(gridSettingsName);
    userSetting.settingJson.columnSizes = columnSizes;
    return this.settingsApiService.update(userSetting.id, userSetting);
  }

  public saveActiveFilters(
    gridSettingsName: string,
    kendoGridState: State,
    gridFilters: CompositeFilterDescriptor,
  ): Observable<GroupSettingDto> {

    const userSetting = this.getUserGridSetting(gridSettingsName);
    userSetting.settingJson.kendoGridState = kendoGridState;
    userSetting.settingJson.filters = gridFilters;
    return this.settingsApiService.update(userSetting.id, userSetting);
  }

  public saveActiveSorts(
    gridSettingsName: string,
    kendoGridState: State,
    gridSorts: Array<SortDescriptor>
  ): Observable<GroupSettingDto> {

    const userSetting = this.getUserGridSetting(gridSettingsName);
    userSetting.settingJson.kendoGridState = kendoGridState;
    userSetting.settingJson.gridSort = gridSorts;
    return this.settingsApiService.update(userSetting.id, userSetting);
  }

  private getUserGridSetting(gridSettingsName: string): GroupSettingDto {
    const index = this.userGrids.findIndex(c => c.name === gridSettingsName);
    if (index !== -1) {
      return this.userGrids[index];
    }
    return <GroupSettingDto> {};
  }

}

export interface GridSetting {
  headers: Array<string>;
  kendoGridState: State;
  filters: CompositeFilterDescriptor;
  columnSizes: Array<ColumnSize>;
  gridSort: Array<SortDescriptor>;
}

export interface ColumnSize {
  fieldName: string;
  width: number;
}
