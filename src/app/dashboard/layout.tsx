'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Loader2 } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { LocalLeap } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

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
      if (!firestore) return;
      const adminDocRef = doc(firestore, 'superAdmins', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      const userIsAdmin = adminDoc.exists();
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        if (!window.location.pathname.startsWith('/dashboard/admin')) {
          router.push('/dashboard/admin');
        }
      } else {
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

  if (isAdmin) {
     return <>{children}</>;
  }

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full flex-col">
       <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
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
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}
