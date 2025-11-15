
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { LocalLeap } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar';
import { SUPER_ADMIN_BUSINESS_ID } from '@/lib/constants';
import { getIdTokenResult } from 'firebase/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    
    // Check for super admin claim and redirect if necessary
    const checkAdminAndRedirect = async () => {
        try {
            const tokenResult = await getIdTokenResult(user, true);
            const isSuperAdmin = tokenResult.claims.isSuperAdmin === true;

            if (isSuperAdmin && !pathname.startsWith('/dashboard/admin')) {
                router.replace('/dashboard/admin');
            }
        } catch (error) {
            console.error("Error checking admin status for redirect:", error);
        }
    };
    
    checkAdminAndRedirect();

  }, [isUserLoading, user, router, pathname]);


  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // The specific admin layout will handle its own rendering,
  // including the loading and access denied states.
  // We just need to let it render if the path matches.
  if (pathname.startsWith('/dashboard/admin')) {
    return <>{children}</>;
  }
  
  // Render the standard user dashboard layout.
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr]">
         <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <LocalLeap className="h-6 w-6" />
                  <span>Local Leap</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              <DashboardNav />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col">
           <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="shrink-0 md:hidden" />
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
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
