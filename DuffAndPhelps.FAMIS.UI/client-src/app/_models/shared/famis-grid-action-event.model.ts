export interface FamisGridActionEvent {
  rowIndex: number;
  item: any;        // Any is intentional, since we can have any item returned from a grid
  action: string;
}
