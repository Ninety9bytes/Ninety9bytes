
export interface FilterTermDto {
  dataTarget: number;
  field: string;
  // This is any to ensure Date types can be used when building filters (eg Mass Update).
  // Strings will break kendo date picker control. When picking a Date with the picker,
  // the control returns a date, when entering a date via typing m/d/yyyy the value is a string
  // See MassUpdateService AddOrUpdateFilter.
  value: any;
}
