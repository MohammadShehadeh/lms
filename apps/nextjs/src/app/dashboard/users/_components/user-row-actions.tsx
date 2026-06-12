"use client";

import type { RouterOutputs } from "@nucleus/api";
import { Button } from "@nucleus/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nucleus/ui/components/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/components/permissions-provider";
import { useTRPC } from "@/trpc/react";

type User = RouterOutputs["users"]["list"]["data"][number];

export function UserRowActions({ user }: { user: User }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canAssign = can("user:assign-role");

  const rolesQuery = useQuery({
    ...trpc.roles.options.queryOptions(),
    enabled: canAssign,
  });

  const setRole = useMutation(
    trpc.users.setRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.users.list.queryFilter());
        toast.success("Role updated");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  if (!canAssign) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Assign role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={user.roleId ?? "none"}
          onValueChange={(value) =>
            setRole.mutate({ userId: user.id, roleId: value === "none" ? null : value })
          }
        >
          <DropdownMenuRadioItem value="none">No role</DropdownMenuRadioItem>
          {rolesQuery.data?.map((role) => (
            <DropdownMenuRadioItem key={role.id} value={role.id}>
              {role.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
