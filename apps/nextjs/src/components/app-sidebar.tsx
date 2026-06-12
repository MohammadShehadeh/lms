"use client";

import type { PermissionKey } from "@nucleus/db/rbac";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@nucleus/ui/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@nucleus/ui/components/sidebar";
import {
  ChevronRight,
  Command,
  HardDrive,
  LifeBuoy,
  type LucideIcon,
  Send,
  ShieldUser,
  User,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavUser } from "./nav-user";
import { Can } from "./permissions-provider";

interface ISidebarMenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  permissions?: PermissionKey[];

  subNav?: {
    title: string;
    url: string;
  }[];
}

export const mainMenu: ISidebarMenuItem[] = [
  {
    title: "Media Library",
    url: "/dashboard/media-library",
    icon: HardDrive,
    isActive: false,
  },
  {
    title: "Manage Users",
    url: "/dashboard/users",
    icon: User,
    permissions: ["user:list"],
  },
  {
    title: "Manage Roles",
    url: "/dashboard/roles",
    icon: ShieldUser,
    permissions: ["role:read"],
  },
];

const navSecondary = [
  { title: "Support", url: "#", icon: LifeBuoy },
  { title: "Feedback", url: "#", icon: Send },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar
      className="h-[calc(100svh-var(--header-height))]! top-[var(--header-height)]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Nucleus</span>
                  <span className="truncate text-xs">Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarMenu>
            {mainMenu.map((mainMenu) => (
              <Can anyOf={mainMenu.permissions} key={mainMenu.url}>
                <Collapsible key={mainMenu.title} asChild defaultOpen={mainMenu.isActive}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={mainMenu.title}>
                      <a href={mainMenu.url}>
                        <mainMenu.icon />
                        <span>{mainMenu.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {mainMenu.subNav?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {mainMenu.subNav.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              </Can>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup {...props}>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
