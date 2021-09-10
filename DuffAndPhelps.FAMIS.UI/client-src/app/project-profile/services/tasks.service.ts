import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { ApiService } from '../../_api/services/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupWorkflowTaskDto } from '../../_api/dtos/group-workflow-task.dto';
import { AssignWorkflowTaskDto } from '../../_api/dtos/assignWorkflowTask.dto';

@Injectable()
export class TasksService {
  runtimeEndpoint: string;

  groupId: string;

  constructor(private configService: ConfigService, private apiService: ApiService, private http: HttpClient) {
    this.runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  }

  getTasks(id: string): Observable<any> {
    const url = `${this.runtimeEndpoint}/Workflows/${id}`;
    return this.apiService.get(url).pipe(map(data => data.tasks));
  }

  getTasksByGroupId(groupId: string): Observable<GroupWorkflowTaskDto[]> {
    const url = `${this.runtimeEndpoint}/Workflows/Group/${groupId}`;
    return this.apiService.get(url).pipe(map(data => (data != null) ? data.tasks : []));
  }

  updateTasks(dto: AssignWorkflowTaskDto): Observable<any> {
    const url = `${this.runtimeEndpoint}/Workflows/Task/Assign`;
    return this.apiService.put(url, dto);
  }

  toggle(taskId, isActive): Observable<any> {
    const url = `${this.runtimeEndpoint}/Workflows/Task/${taskId}/Toggle?isActive=${isActive}`;
    return this.apiService.put(url);
  }

  getTypeName(typeId: number): string {
    let name = '';

    switch (typeId) {
      case 1:
        name = 'Setup';
        break;
      case 2:
        name = 'To do';
        break;
      case 3:
        name = 'Approval';
        break;
      case 4:
        name = 'Final Approval';
        break;
      default:
        name = '';
    }

    return name;
  }

  getStatusName(typeId: number): string {
    let name = '';

    switch (typeId) {
      case 1:
        name = 'Create';
        break;
      case 2:
        name = 'Active';
        break;
      case 3:
        name = 'Escalate';
        break;
      case 4:
        name = 'Complete';
        break;
      case 5:
        name = 'Approved';
        break;
      default:
        name = '';
    }

    return name;
  }
}
