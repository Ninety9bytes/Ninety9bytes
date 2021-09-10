import { TasksService } from '../../services/tasks.service';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbModalRef, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Task } from '../../../_models/task.model';
import { AssignWorkflowTaskDto } from '../../../_api/dtos/assignWorkflowTask.dto';


@Component({
  selector: 'edit-task',
  templateUrl: './edit-task.component.html'
})
export class EditTaskComponent implements OnInit {
  @ViewChild('modalContent', {static: false}) modalContent;
  private modalRef: NgbModalRef;

  @Output() onTaskModified = new EventEmitter<Task>();

  dto: AssignWorkflowTaskDto;
  currentTask: Task;

  constructor(
    private modalService: NgbModal,
    private taskService: TasksService
  ) {}

  users = [
    { id: '9f19f4ca-4dc4-4296-97a9-3f83b720e5fc', name: 'Cynthia Wagner' },
    { id: 'd4252141-3c93-4105-a83e-4bb497186bb7', name: 'Jacob Gilbert' },
    { id: '11d219e1-8004-4dec-877c-bbbf0e8efa16', name: 'Jose Herrera' },
    { id: 'bc6c50dc-7289-46db-8cb3-cf89556177ca', name: 'Dorothy Graham' },
    { id: '5d929ce8-0145-4541-8071-36d5666141a4', name: 'Diane Valdez' }
  ];

  open(currentTask: Task, e: any) {
    e.preventDefault();

    this.currentTask = currentTask;

    this.dto = new AssignWorkflowTaskDto(
      currentTask.id,
      currentTask.assignedUserId,
      currentTask.assignedTeamId,
      currentTask.escalationDays,
      currentTask.escalationuserId,
      currentTask.escalationTeamId
    );

    this.dto.workflowTaskId = currentTask.id;
    this.dto.assignedUserId = currentTask.assignedUserId;
    this.modalRef = this.modalService.open(this.modalContent);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onSubmit(form): void {
    if (form.valid) {
      this.taskService.updateTasks(this.dto).subscribe(result => {
        // console.log("Task saved successfully");

        const modifiedTask = new Task(
          result.Id,
          result.WorkflowId,
          this.taskService.getTypeName(result.TaskType),
          result.Description,
          this.taskService.getStatusName(result.Status),
          result.LastExecutionTime,
          result.IsActive,
          result.AssignedUserId,
          result.AssignedTeamId,
          result.AssignedToName,
          result.EscalationDays,
          result.EscalationUserId,
          result.EscalationTeamId,
          result.EscalatedToName,
          result.PreceedingTasks,
          result.SubsequantTasks
        );

        this.onTaskModified.emit(modifiedTask);

        this.modalRef.dismiss();
      });
    }
  }

  ngOnInit() {}
}
