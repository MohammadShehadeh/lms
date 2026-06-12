"use client";

import type { RouterOutputs } from "@nucleus/api";
import { SUPER_ADMIN_SLUG } from "@nucleus/db/rbac";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@nucleus/ui/components/alert-dialog";
import { Button } from "@nucleus/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nucleus/ui/components/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { usePermissions } from "@/components/permissions-provider";
import { useTRPC } from "@/trpc/react";
import { RoleFormDialog } from "./role-form-dialog";

type Role = RouterOutputs["roles"]["list"]["data"][number];

export function RoleRowActions({ role }: { role: Role }) {
  const trpc = useTRPC();
  const router = useRouter();
  const { can } = usePermissions();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // The table renders from RSC props, so refresh the server component to reflect changes.
  const refresh = () => router.refresh();

  const deleteMutation = useMutation(
    trpc.roles.delete.mutationOptions({
      onSuccess: () => {
        refresh();
        toast.success("Role deleted");
        setDeleteOpen(false);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const setDefaultMutation = useMutation(
    trpc.roles.setDefault.mutationOptions({
      onSuccess: () => {
        refresh();
        toast.success("Default role updated");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isSuperAdmin = role.slug === SUPER_ADMIN_SLUG;
  const canUpdate = can("role:update");
  const canDelete = can("role:delete");
  const showActions = !isSuperAdmin && (canUpdate || canDelete);

  if (!showActions) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canUpdate && <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>}
          {canUpdate && !role.isDefault && (
            <DropdownMenuItem onClick={() => setDefaultMutation.mutate({ id: role.id })}>
              Set as default
            </DropdownMenuItem>
          )}
          {canDelete && !role.isSystem && !role.isDefault && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleFormDialog open={editOpen} onOpenChange={setEditOpen} role={role} onSaved={refresh} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{role.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Users with this role will have it removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate({ id: role.id })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
