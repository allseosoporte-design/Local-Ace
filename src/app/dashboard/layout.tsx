'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Loader2 } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
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
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isUserLoading || !firestore) {
      return; 
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    const checkAdminAndRoute = async () => {
      try {
        const adminDocRef = doc(firestore, 'superAdmins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        const isSuperAdmin = adminDoc.exists();
        
        // This is the problematic part. We should not redirect if the user is already in a dashboard path
        // other than the standard user one.
        if (isSuperAdmin && pathname === '/dashboard') {
          // If super admin is on the standard user dashboard, redirect to admin dashboard.
          router.replace('/dashboard/admin');
        } else if (!isSuperAdmin && pathname.startsWith('/dashboard/admin')) {
          // If a non-admin tries to access an admin path, redirect to standard dashboard.
          router.replace('/dashboard');
        } else {
          // Otherwise, the user is in the correct place.
          setIsReady(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (pathname.startsWith('/dashboard/admin')) {
           router.replace('/dashboard');
        } else {
           setIsReady(true);
        }
      }
    };

    checkAdminAndRoute();

  }, [isUserLoading, user, firestore, pathname, router]);


  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // The specific admin layout will render its own sidebar structure
  if (pathname.startsWith('/dashboard/admin')) {
    return <>{children}</>;
  }
  
  // Render the standard user dashboard layout
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
