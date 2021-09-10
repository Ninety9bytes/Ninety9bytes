export interface GroupWorkflowTaskDto {
  id: string;
  workflowId: string;
  taskType: number;
  description: string;
  status: number;
  lastExecutionTime: string;
  isActive: boolean;
  order: string;
  assignedUserId: string;
  assignedTeamId: string;
  assignedToName: string;
  escalationDays: number;
  escalationUserId: string;
  escalationTeamId: string;
  escalatedToName: string;

  preceedingTasks: Array<string>;
  subsequentTasks: Array<string>;
}
