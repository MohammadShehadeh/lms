"use client";

import type { RouterOutputs } from "@nucleus/api";
import { Badge } from "@nucleus/ui/components/badge";
import { Checkbox } from "@nucleus/ui/components/checkbox";
import { DataTableColumnHeader } from "@nucleus/ui/components/data-table/data-table-column-header";
import { formatDate } from "@nucleus/ui/lib/format";
import type { ColumnDef } from "@tanstack/react-table";

type User = RouterOutputs["users"]["list"]["data"][number];

export function getColumns(): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
      enableColumnFilter: true,
      meta: {
        label: "Name",
        variant: "text" as const,
        placeholder: "Search names...",
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Email" />,
      enableColumnFilter: true,
      meta: {
        label: "Email",
        variant: "text" as const,
        placeholder: "Search emails...",
      },
    },
    {
      accessorKey: "emailVerified",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Verified" />,
      cell: ({ row }) => {
        const verified = row.getValue<boolean>("emailVerified");
        return (
          <Badge variant={verified ? "default" : "secondary"}>
            {verified ? "Verified" : "Unverified"}
          </Badge>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: "Verified",
        variant: "select" as const,
        options: [
          { label: "Verified", value: "true" },
          { label: "Unverified", value: "false" },
        ],
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
      cell: ({ row }) => formatDate(row.getValue<Date>("createdAt")),
      enableSorting: true,
    },
  ];
}
