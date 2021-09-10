export class AssignWorkflowTaskDto {
  constructor(
    public workflowTaskId?: string,
    public assignedUserId?: string,
    public assignedTeamId?: string,
    public escalationDays?: number,
    public escalationUserId?: string,
    public escalationTeamId?: string
  ) {}
}
