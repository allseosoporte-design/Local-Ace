'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminStatus = async () => {
      const adminDocRef = doc(firestore, 'superAdmins', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      const userIsAdmin = adminDoc.exists();
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        // If user is admin and not already on the admin dashboard, redirect.
        if (!window.location.pathname.startsWith('/dashboard/admin')) {
          router.push('/dashboard/admin');
        }
      } else {
         // If user is not admin and is on an admin route, redirect to general dashboard.
         if (window.location.pathname.startsWith('/dashboard/admin')) {
          router.push('/dashboard');
        }
      }
    };

    checkAdminStatus();

  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is an admin, the admin layout will be rendered via its own page.
  // This layout is for non-admin users.
  if (isAdmin) {
     // Still render children for the admin pages, but the nav might be different.
     // The admin page will have its own structure.
     return <>{children}</>;
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
            <UserNav />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
