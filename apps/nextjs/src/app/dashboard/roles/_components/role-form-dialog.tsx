"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nucleus/ui/components/form";
import { Input } from "@nucleus/ui/components/input";
import { Textarea } from "@nucleus/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { useTRPC } from "@/trpc/react";

type Role = RouterOutputs["roles"]["list"]["data"][number];

const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200),
  permissions: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

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

  const form = useForm<RoleFormData>({
    resolver: standardSchemaResolver(roleFormSchema),
    defaultValues: { name: "", description: "", permissions: [] },
    values: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
    },
  });

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

  const onSubmit = (data: RoleFormData) => {
    const permissions = data.permissions as PermissionKey[];
    if (isEdit && role) {
      updateMutation.mutate({
        id: role.id,
        name: data.name,
        description: data.description || null,
        permissions,
      });
      return;
    }

    createMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      permissions,
    });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={role?.isSystem} placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What is this role for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="flex flex-col gap-3">
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
                                    checked={field.value.includes(permission)}
                                    onCheckedChange={(checked) =>
                                      field.onChange(
                                        checked === true
                                          ? [...field.value, permission]
                                          : field.value.filter((p) => p !== permission)
                                      )
                                    }
                                  />
                                  <span className="capitalize">{action}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isEdit ? "Save changes" : "Create role"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {isWildcard && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
