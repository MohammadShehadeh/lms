"use client";

import type { RouterOutputs } from "@nucleus/api";
import { Button } from "@nucleus/ui/components/button";
import { DataTable } from "@nucleus/ui/components/data-table/data-table";
import { DataTableToolbar } from "@nucleus/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@nucleus/ui/hooks/use-data-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePermissions } from "@/components/permissions-provider";
import { getColumns } from "../_lib/columns";
import { RoleFormDialog } from "./role-form-dialog";

interface RolesTableProps {
  initialData: RouterOutputs["roles"]["list"];
}

export function RolesTable({ initialData }: RolesTableProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);

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
      <DataTableToolbar table={table}>
        {can("role:create") && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New role
          </Button>
        )}
      </DataTableToolbar>
      <RoleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => router.refresh()}
      />
    </DataTable>
  );
}
