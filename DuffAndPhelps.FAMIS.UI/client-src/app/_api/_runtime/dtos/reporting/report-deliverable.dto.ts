export interface ReportDeliverable {
  reportName: string;
  requestedDateTime: Date;
  requestedUserId: string;
  isPending: boolean;
  downloadLink: string;
  status: string;
  fileName: string;
  id: string;
}
