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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait until Firebase auth state is resolved
    if (isUserLoading || !firestore) {
      return; 
    }

    // If no user, redirect to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Check for admin status
    const checkAdminStatus = async () => {
      try {
        const adminDocRef = doc(firestore, 'superAdmins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        const userIsAdmin = adminDoc.exists();

        const onAdminPath = pathname.startsWith('/dashboard/admin');

        // Redirect logic
        if (userIsAdmin && !onAdminPath) {
          router.replace('/dashboard/admin');
        } else if (!userIsAdmin && onAdminPath) {
          router.replace('/dashboard');
        } else {
          setAuthChecked(true); // Allow rendering
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Fallback for safety: not an admin, ensure they are not on admin path
        if (pathname.startsWith('/dashboard/admin')) {
           router.replace('/dashboard');
        } else {
           setAuthChecked(true);
        }
      }
    };

    checkAdminStatus();

  }, [isUserLoading, user, firestore, pathname, router]);

  // Show a loader while we are verifying auth and roles
  if (!authChecked || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // At this point, auth is checked and redirection (if any) has happened.
  // The Admin page has its own layout, so we only render the user layout here.
  // The router will have already moved away if the user is an admin.
  if (pathname.startsWith('/dashboard/admin')) {
    return <>{children}</>;
  }

  // Regular user layout
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
