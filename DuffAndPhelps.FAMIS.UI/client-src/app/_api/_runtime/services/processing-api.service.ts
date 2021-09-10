import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { DepreciationSubmissionRequestDto } from '../dtos/depreciation-request.dto';
import { ProcessingExecutionResult } from '../dtos/processing-execution-result.dto';
import { ProcessingDetailRequestDto } from '../dtos/processing-detail-request.dto';
import { ProcessingDetailResponseDto } from '../dtos/processing-detail-response.dto';
import { ProcessingStatusDto } from '../dtos/processing-status.dto';
import { ProcessingSubmissionResponseDto } from '../dtos/processing-submission-response.dto';
import { TrendingRequestDto } from '../dtos/trending-request.dto';

@Injectable()
export class ProcessingApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public executeDepreciation(groupId: string, request: DepreciationSubmissionRequestDto):
  Observable<ProcessingExecutionResult> {
    return this.apiService.post(`${this.runtimeEndpoint}/Processing/${groupId}/Depreciation/Execute`, request);
  }

  public getDepreciationResults(groupId: string, request: ProcessingDetailRequestDto):
  Observable<ProcessingDetailResponseDto>{
    return this.apiService.post(`${this.runtimeEndpoint}/Processing/${groupId}/Depreciation/Results`, request);
  }

  public getProcessingStatus(groupId: string): Observable<ProcessingStatusDto>{
    return this.apiService.get(`${this.runtimeEndpoint}/Processing/${groupId}/Status`);
  }

  public commitDepreciation(groupId: string): Observable<ProcessingSubmissionResponseDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Processing/${groupId}/Depreciation/Commit`);
  }

    // TODO: Implement ot copy-over remaining service methods
  // GET DepreciationDetail (GroupId, BookId), returns all fields from AssetFileRecordDepreciations and a list of those in error. Should support Take and Skip and return total record count for each.
  // POST CommitDepreciation takes a GroupId and an BookId
  // GET /api/contract/{contractId}/Groups/{groupId}

  // POST ExecuteTrending: pass TrendingSubmissionRequestDto, called from setup page at run
  public executeTrending(groupId: string, request: TrendingRequestDto): Observable<ProcessingSubmissionResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Processing/${groupId}/Trending/Execute`, request);
  }  

  public getTrendingResults(groupId: string, request: ProcessingDetailRequestDto): Observable<ProcessingDetailResponseDto>{
    return this.apiService.post(`${this.runtimeEndpoint}/Processing/${groupId}/Trending/Results`, request);
  }

  public commitTrending(groupId: string): Observable<ProcessingSubmissionResponseDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Processing/${groupId}/Trending/Commit`);
  }
}
