'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { LocalLeap } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    
    // La lógica de admin se moverá al admin/layout.tsx
    // Este layout ahora solo se preocupa de que haya un usuario logueado.
    setIsReady(true);

  }, [isUserLoading, user, pathname, router]);


  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // El layout específico de admin renderizará su propia estructura.
  if (pathname.startsWith('/dashboard/admin')) {
    return <>{children}</>;
  }
  
  // Renderizar el layout del dashboard de usuario estándar.
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
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
