export class Task {
  constructor(
    public id?: string,
    public WorkflowId?: string,
    public taskType?: string,
    public description?: string,
    public status?: string,
    public lastExecutionTime?: string,
    public isActive?: boolean,
    public assignedUserId?: string,
    public assignedTeamId?: string,
    public assignedToName?: string,
    public escalationDays?: number,
    public escalationuserId?: string,
    public escalationTeamId?: string,
    public escalationToName?: string,
    public preceedingTasks?: Array<any>,
    public SubsequentTasks?: Array<any>
  ) {}
}

