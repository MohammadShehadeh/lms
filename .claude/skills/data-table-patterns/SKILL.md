---
name: data-table-patterns
description: Patterns for building server-side data tables with filtering, sorting, and pagination. Use when creating or modifying data table pages, search params parsing, or list API endpoints.
---

# Data Table Patterns

This project uses the tablecn pattern: TanStack Table + nuqs URL state + Drizzle server-side queries.

## Architecture Overview

```
page.tsx (RSC)              → searchParamsCache.parse() → api.entity.list()
  ↓ initialData
_components/entity-table.tsx (client) → useDataTable() → DataTable + DataTableToolbar
_lib/search-params.ts       → createSearchParamsCache (nuqs/server)
_lib/columns.tsx            → ColumnDef[] with filter meta
```

## File Structure for a Data Table Page

```
apps/nextjs/src/app/dashboard/{entity}/
├── page.tsx                    # RSC: parse params, fetch data, render
├── _components/
│   └── {entity}-table.tsx      # Client: useDataTable + DataTable
└── _lib/
    ├── columns.tsx             # Column definitions with filter meta
    └── search-params.ts        # searchParamsCache definition
```

## 1. Search Params (nuqs/server)

Use `createSearchParamsCache` with the same parsers the client hook uses.
This is the single source of truth — no manual string parsing.

```typescript
// _lib/search-params.ts
import type { RouterOutputs } from "@nucleus/api";
import { getSortingStateParser } from "@nucleus/ui/lib/parsers";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

type Entity = RouterOutputs["entity"]["list"]["data"][number];

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Entity>().withDefault([{ id: "createdAt", desc: true }]),
  // column filters — one entry per filterable column
  name: parseAsString.withDefault(""),                                          // text
  status: parseAsArrayOf(parseAsStringEnum(["active", "inactive"])).withDefault([]), // select
});

export type GetEntitySchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
```

**Rules:**
- Text filter columns → `parseAsString.withDefault("")`
- Select/multiSelect filter columns → `parseAsArrayOf(parseAsStringEnum([...values])).withDefault([])`
- Range/number filter columns → `parseAsArrayOf(parseAsInteger).withDefault([])`
- Date filter columns → `parseAsArrayOf(parseAsInteger).withDefault([])` (timestamps)
- Always pass the entity type to `getSortingStateParser<Entity>()` for type-safe sort IDs

## 2. Page Component (RSC)

Parse search params and fetch data server-side. Pass result as `initialData`.

```typescript
// page.tsx
import type { SearchParams } from "nuqs/server";
import { api } from "@/trpc/server";
import { EntityTable } from "./_components/entity-table";
import { searchParamsCache } from "./_lib/search-params";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function EntityPage({ searchParams }: PageProps) {
  const search = searchParamsCache.parse(await searchParams);

  const result = await api.entity.list({
    page: search.page,
    perPage: search.perPage,
    sort: search.sort,
    name: search.name,
    status: search.status,
  });

  return <EntityTable initialData={result} />;
}
```

## 3. Client Table Component

Use `useDataTable` with `shallow: false` so URL changes trigger server re-renders.

```typescript
// _components/entity-table.tsx
"use client";

import type { RouterOutputs } from "@nucleus/api";
import { DataTable } from "@nucleus/ui/components/data-table/data-table";
import { DataTableToolbar } from "@nucleus/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@nucleus/ui/hooks/use-data-table";
import { getColumns } from "../_lib/columns";

interface EntityTableProps {
  initialData: RouterOutputs["entity"]["list"];
}

export function EntityTable({ initialData }: EntityTableProps) {
  const columns = getColumns();

  const { table } = useDataTable({
    data: initialData.data,
    columns,
    pageCount: initialData.pageCount,
    shallow: false,  // triggers RSC re-render on filter/sort/page change
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
```

**Key props:**
- `shallow: false` — URL changes hit the server (required for server-side filtering)
- `prefix: "entity."` — namespace URL params when multiple tables share a page

## 4. Column Definitions

Each column declares its filter variant via `meta`. The toolbar auto-generates filter UI from this.

```typescript
// _lib/columns.tsx
"use client";

import type { RouterOutputs } from "@nucleus/api";
import type { ColumnDef } from "@tanstack/react-table";

type Entity = RouterOutputs["entity"]["list"]["data"][number];

export function getColumns(): ColumnDef<Entity>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
      enableColumnFilter: true,
      meta: {
        label: "Name",
        variant: "text" as const,        // text → iLike search
        placeholder: "Search names...",
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        variant: "select" as const,      // select → eq/inArray
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
      cell: ({ row }) => formatDate(row.getValue<Date>("createdAt")),
      enableSorting: true,               // sortable but not filterable
    },
  ];
}
```

**Filter variant mapping:**
| Variant        | URL parser                    | API operator     |
|---------------|-------------------------------|------------------|
| `text`        | `parseAsString`               | `iLike`          |
| `select`      | `parseAsArrayOf(parseAsStringEnum)` | `eq` / `inArray` |
| `multiSelect` | `parseAsArrayOf(parseAsStringEnum)` | `inArray`        |
| `range`       | `parseAsArrayOf(parseAsInteger)`    | `gte` / `lte`    |
| `date`        | `parseAsArrayOf(parseAsInteger)`    | `gte` / `lte`    |

## 5. API Router (list procedure)

Accept column filters and build Drizzle WHERE clauses directly.

```typescript
// packages/api/src/router/entity.ts
import { and, asc, count, desc, ilike, inArray } from "drizzle-orm";

export const entityRouter = {
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      perPage: z.number().min(1).max(50).default(10),
      sort: sortSchema.optional(),
      // column filters
      name: z.string().optional(),
      status: z.array(z.string()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, perPage, sort } = input;
      const offset = (page - 1) * perPage;

      const where = and(
        input.name ? ilike(entity.name, `%${input.name}%`) : undefined,
        input.status?.length ? inArray(entity.status, input.status) : undefined,
      );

      const orderBy = sort?.length
        ? sort
            .filter((s) => s.id in sortableColumns)
            .map((s) => {
              const col = sortableColumns[s.id as keyof typeof sortableColumns];
              return s.desc ? desc(col) : asc(col);
            })
        : [desc(entity.createdAt)];

      const [data, total] = await Promise.all([
        ctx.db.select().from(entity).where(where).orderBy(...orderBy)
          .limit(perPage).offset(offset),
        ctx.db.select({ count: count() }).from(entity).where(where),
      ]);

      return {
        data,
        pageCount: Math.ceil((total[0]?.count ?? 0) / perPage),
      };
    }),
} satisfies TRPCRouterRecord;
```

## Shared Utilities

These are already in the monorepo — import, don't recreate:

| Import | Package | Purpose |
|--------|---------|---------|
| `useDataTable` | `@nucleus/ui/hooks/use-data-table` | Table hook with URL state |
| `DataTable`, `DataTableToolbar`, etc. | `@nucleus/ui/components/data-table/*` | UI components |
| `getSortingStateParser` | `@nucleus/ui/lib/parsers` | nuqs parser for sort state |

## Checklist for Adding a New Data Table Page

1. **Schema**: Ensure the DB table exists in `packages/db/src/schema/`
2. **API router**: Create `packages/api/src/router/{entity}.ts` with `list` procedure
3. **Register router**: Add to `packages/api/src/root.ts`
4. **search-params.ts**: Define `searchParamsCache` with one entry per filterable column
5. **columns.tsx**: Define `ColumnDef[]` with `meta.variant` matching the search param parsers
6. **page.tsx**: Parse params → call API → pass `initialData`
7. **entity-table.tsx**: `useDataTable({ shallow: false })` → `DataTable` + `DataTableToolbar`
