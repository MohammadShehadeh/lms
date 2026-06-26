import { SidebarInset, SidebarProvider } from "@nucleus/ui/components/sidebar";

import { getSession } from "@/auth/server";
import { AppSidebar } from "@/components/app-sidebar";
import { PermissionsProvider } from "@/components/permissions-provider";
import { SiteHeader } from "@/components/site-header";

export const description = "A sidebar with a header and a search form.";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = {
    name: session?.user.name ?? "User",
    email: session?.user.email ?? "",
    avatar: session?.user.image ?? "",
  };

  return (
    <PermissionsProvider permissions={session?.user.permissions ?? []}>
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar user={user} />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </PermissionsProvider>
  );
}
