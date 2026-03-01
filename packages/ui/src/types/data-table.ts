import type { FilterVariant } from "@nucleus/validators/data-table";
import type { Row, RowData } from "@tanstack/react-table";

// Re-export shared types from validators
export type { ExtendedColumnSort, FilterVariant } from "@nucleus/validators/data-table";

// UI-specific types (depend on React / TanStack)

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  }
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: "update" | "delete";
}
