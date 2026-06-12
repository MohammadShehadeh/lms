"use client";

import type { RouterOutputs } from "@nucleus/api";
import { PERMISSION_GROUPS, type PermissionKey, WILDCARD_PERMISSION } from "@nucleus/db/rbac";
import { Button } from "@nucleus/ui/components/button";
import { Checkbox } from "@nucleus/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nucleus/ui/components/dialog";
import { Input } from "@nucleus/ui/components/input";
import { Label } from "@nucleus/ui/components/label";
import { Textarea } from "@nucleus/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/react";

type Role = RouterOutputs["roles"]["list"]["data"][number];

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSaved: () => void;
}

export function RoleFormDialog({ open, onOpenChange, role, onSaved }: RoleFormDialogProps) {
  const trpc = useTRPC();
  const isEdit = !!role;
  const isWildcard = role?.permissions.includes(WILDCARD_PERMISSION) ?? false;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
      setSelected(new Set(role?.permissions ?? []));
    }
  }, [open, role]);

  const createMutation = useMutation(
    trpc.roles.create.mutationOptions({
      onSuccess: () => {
        toast.success("Role created");
        onSaved();
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const updateMutation = useMutation(
    trpc.roles.update.mutationOptions({
      onSuccess: () => {
        toast.success("Role updated");
        onSaved();
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const toggle = (key: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const onSubmit = () => {
    const permissions = [...selected] as PermissionKey[];
    if (isEdit && role) {
      updateMutation.mutate({ id: role.id, name, description: description || null, permissions });
    } else {
      createMutation.mutate({ name, description: description || undefined, permissions });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit role" : "New role"}</DialogTitle>
          <DialogDescription>Choose the permissions this role grants.</DialogDescription>
        </DialogHeader>

        {isWildcard ? (
          <p className="text-muted-foreground text-sm">
            This role has full access and cannot be edited.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={name}
                disabled={role?.isSystem}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this role for?"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label>Permissions</Label>
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.resource} className="rounded-md border p-3">
                  <p className="mb-2 font-medium text-sm capitalize">{group.resource}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.permissions.map((permission) => {
                      const action = permission.split(":")[1];
                      const fieldId = `perm-${permission.replace(":", "-")}`;
                      return (
                        <label
                          key={permission}
                          htmlFor={fieldId}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            id={fieldId}
                            checked={selected.has(permission)}
                            onCheckedChange={(checked) => toggle(permission, checked === true)}
                          />
                          <span className="capitalize">{action}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isWildcard && (
            <Button onClick={onSubmit} disabled={isPending || !name.trim()}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create role"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
