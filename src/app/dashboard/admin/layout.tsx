'use client';

import Link from 'next/link';
import { AdminNav } from '@/components/admin-nav';
import { UserNav } from '@/components/user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LocalLeap } from '@/components/icons';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <LocalLeap className="h-6 w-6" />
                <span>Local Leap</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              <AdminNav />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="shrink-0 md:hidden" />
            <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <UserNav />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
