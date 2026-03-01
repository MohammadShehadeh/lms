"use client";

import type { RouterOutputs } from "@nucleus/api";
import { DataTable } from "@nucleus/ui/components/data-table/data-table";
import { DataTableToolbar } from "@nucleus/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@nucleus/ui/hooks/use-data-table";
import { getColumns } from "../_lib/columns";

interface UsersTableProps {
  initialData: RouterOutputs["users"]["list"];
}

export function UsersTable({ initialData }: UsersTableProps) {
  const columns = getColumns();

  const { table } = useDataTable({
    data: initialData.data,
    columns,
    pageCount: initialData.pageCount,
    shallow: false,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
