import { RowClassArgs } from '@progress/kendo-angular-grid';
import { TasksService } from '../../services/tasks.service';
import { ProjectProfileService } from '../../services/project-profile.service';
import { Task } from '../../../_models/task.model';
import { GroupWorkflowTaskDto } from '../../../_api/dtos/group-workflow-task.dto';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'task-management',
  templateUrl: './task-management.component.html'
})
export class TaskManagementComponent implements OnInit {
  public tasksGridBusy = true;

  @ViewChild('editModel', {static: false}) editModal;

  public tasks: Array<Task> = new Array<Task>();

  constructor(
    private taskService: TasksService, private projectProfileService: ProjectProfileService,
    private route: ActivatedRoute
  ) { }

  isDisabled(context: RowClassArgs) {
    return !context.dataItem.isActive ? 'disabled-row' : 'enabled-row';
  }

  toggle(id: string, e: any) {
    e.preventDefault();
    const index = this.tasks.findIndex(c => c.id === id);

    let isActive = false;

    if (this.tasks[index].isActive) {
      isActive = false;
    } else {
      isActive = true;
    }

    this.taskService.toggle(id, isActive).subscribe(success => {
      this.tasks[index].isActive = isActive;
    });
  }

  canBeDisabled(type: string): boolean {
    // Cannot disable tasks named "Create Profile" or "Final Approval"
    return !(type === 'Create Profile' || type === 'Final');

    // Todo: Should this just be property on the Task returned from the API i.e. canBeDisabled???
  }

  handleTaskModified(task: Task) {
    // Todo: Map back to UI Task model
    const index = this.tasks.findIndex(c => c.id === task.id);

    this.tasks[index] = task;

    // console.log(event);
  }

  setTasks(tasks: Array<GroupWorkflowTaskDto>) {
    if (tasks == null || tasks.length === 0) {
      return;
    }

    tasks
      .sort(function (task1, task2) {
        if (task1.order < task2.order) {
          return -1;
        } else if (task1.order > task2.order) {
          return 1;
        } else {
          return 0;
        }
      })
      .forEach(t => {
        this.tasks.push(
          new Task(
            t.id,
            t.workflowId,
            this.taskService.getTypeName(t.taskType),
            t.description,
            this.taskService.getStatusName(t.status),
            t.lastExecutionTime,
            t.isActive,
            t.assignedUserId,
            t.assignedTeamId,
            t.assignedToName,
            t.escalationDays,
            t.escalationUserId,
            t.escalationTeamId,
            t.escalatedToName,
            t.preceedingTasks,
            t.subsequentTasks
          )
        );
      });
  }

  ngOnInit() {
    this.taskService.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.taskService.getTasksByGroupId(this.taskService.groupId)
      .subscribe(
      results => this.setTasks(results),
      error => { },
      () => this.tasksGridBusy = false);
  }
}
