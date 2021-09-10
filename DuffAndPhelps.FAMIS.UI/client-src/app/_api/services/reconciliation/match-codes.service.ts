
import {map, tap} from 'rxjs/operators';

import { ApiService } from '../api.service';
import { Injectable } from '@angular/core';
import { MatchCode } from '../../../_models/match-code.model';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatchCodeCategory } from '../../../_models/match-code-category.model';
import { GroupMatchCode } from '../../../_models/group-match-code.model';

@Injectable()
export class MatchCodesService {


  runtimeApiEndpoint: string;
  configurationApiEndpoint: string;

  cachedMatchCodes: MatchCode[];

  constructor(
    private configService: ConfigService,
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.runtimeApiEndpoint = this.configService.getSettings(
      'runtimeApiEndpoint'
    );
    this.configurationApiEndpoint = this.configService.getSettings(
      'configurationApiEndpoint'
    );
  }

  getMatchCodes(): Observable<MatchCode[]> {
    const url = `${this.configurationApiEndpoint}/matchcodes`;
    // console.log("getmatchcodes", url);
    return this.apiService
      .get(url).pipe(
      map(results => MatchCode.jsonArrayToObjects(results)));
  }

  getMatchCodeCategories(): Observable<MatchCodeCategory[]> {
    return this.apiService
      .get(`${this.configurationApiEndpoint}/matchcodecategories`).pipe(
      map(results => MatchCodeCategory.jsonArrayToObjects(results)));
  }

  saveGroupMatchCodesSelection(
    groupId,
    selectedMatchCodes
  ): Observable<any> {
    if (selectedMatchCodes === []) { return; }
    const groupMatchCodes: GroupMatchCode[] = new Array<GroupMatchCode>();
    selectedMatchCodes.forEach((code: MatchCode) => {
      groupMatchCodes.push(
        new GroupMatchCode(
          groupId,
          code.id,
          code.name,
          code.description,
          code.categoryId,
          code.isEnabled,
          true,
          false,
        )
      );
    });

    const url = `${this.runtimeApiEndpoint}/matchcodes/group/${groupId}`;
    const body = {
      groupId: groupId,
      matchCodes: groupMatchCodes
    };

    return this.apiService.post(url, body);
  }

  getGroupMatchCodesSelection(groupId: string): Observable<string[]> {
    const url = `${this.runtimeApiEndpoint}/matchcodes/group/${groupId}`;
    return this.apiService
      .get(url).pipe(
      map(function(results) {
        const ids = new Array<string>();
        results.forEach(code => {
          if (code.groupMatchCodeIsEnabled && code.matchCodeIsEnabled) {
            ids.push(code.matchCodeId);
          }
        });
        return ids;
      }))
      .pipe(tap(console.log));
  }

  getGroupMatchCodes(groupId: string): Observable<GroupMatchCode[]> {
    const url = `${this.runtimeApiEndpoint}/matchcodes/group/${groupId}`;
    return this.apiService
      .get(url).pipe(
      map(function(results) {
        const codes = new Array<GroupMatchCode>();
        results.forEach(code => {
          codes.push(code);
        });
        return codes;
      }));
  }

  createMatchCode(matchCode: MatchCode): Observable<MatchCode> {
    const newMatchCode = {
      name: matchCode.name,
      description: matchCode.description,
      categoryId: matchCode.categoryId,
      isEnabled: matchCode.isEnabled
    };

    return this.apiService
      .post(
        `${this.configurationApiEndpoint}/matchcodes`,
        newMatchCode
      ).pipe(
      map(code => MatchCode.toObjectFromJson(code)));
  }

  updateMatchCode(matchCode: MatchCode): Observable<MatchCode> {
    return this.apiService
      .put(
        `${this.configurationApiEndpoint}/matchcodes/${matchCode.id}`,
        matchCode
      ).pipe(
      map(code => MatchCode.toObjectFromJson(code)));
  }

  getMatchCodeById(id: string): Observable<MatchCode> {
    return this.apiService
      .get(`${this.configurationApiEndpoint}/matchcodes/${id}`).pipe(
      map(res => MatchCode.toObjectFromJson(res)));
  }
}
