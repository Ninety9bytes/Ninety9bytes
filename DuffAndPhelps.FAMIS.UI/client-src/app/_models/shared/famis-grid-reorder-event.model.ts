export interface GridReorderEvent {
    column: GridReorderEventColumn;
    newIndex: number;
    oldIndex: number;
}

export interface GridReorderEventColumn {
    field: string;
    title: string;
}
