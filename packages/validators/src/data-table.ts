export type FilterVariant =
  | "text"
  | "number"
  | "range"
  | "date"
  | "dateRange"
  | "boolean"
  | "select"
  | "multiSelect";

export interface ExtendedColumnSort<TData> {
  id: Extract<keyof TData, string>;
  desc: boolean;
}
