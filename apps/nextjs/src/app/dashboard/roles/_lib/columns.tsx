"use client";

import type { RouterOutputs } from "@nucleus/api";
import { WILDCARD_PERMISSION } from "@nucleus/db/rbac";
import { Badge } from "@nucleus/ui/components/badge";
import { DataTableColumnHeader } from "@nucleus/ui/components/data-table/data-table-column-header";
import { formatDate } from "@nucleus/ui/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import { RoleRowActions } from "../_components/role-row-actions";

type Role = RouterOutputs["roles"]["list"]["data"][number];

function PermissionSummary({ permissions }: { permissions: string[] }) {
  if (permissions.includes(WILDCARD_PERMISSION)) {
    return <Badge>All access</Badge>;
  }
  return (
    <span className="text-muted-foreground text-sm">
      {permissions.length} permission{permissions.length === 1 ? "" : "s"}
    </span>
  );
}

export function getColumns(): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{role.name}</span>
            {role.isDefault && <Badge variant="secondary">Default</Badge>}
            {role.isSystem && <Badge variant="outline">System</Badge>}
          </div>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: "Name",
        variant: "text" as const,
        placeholder: "Search names...",
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Description" />,
      cell: ({ row }) => {
        const description = row.getValue<string | null>("description");
        return description ? (
          <span className="text-muted-foreground">{description}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Permissions" />,
      cell: ({ row }) => <PermissionSummary permissions={row.getValue<string[]>("permissions")} />,
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
      cell: ({ row }) => formatDate(row.getValue<Date>("createdAt")),
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => <RoleRowActions role={row.original} />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
  ];
}
