'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { LocalLeap } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
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

    // CRITICAL: Ensure the business document exists for the logged-in user.
    const ensureBusinessDocExists = async () => {
      // Only run if firestore and user are available.
      if (user && firestore) {
        const businessRef = doc(firestore, "businesses", user.uid);
        try {
            const businessDoc = await getDoc(businessRef);
            if (!businessDoc.exists()) {
              // If the business document doesn't exist, create it.
              // This is crucial for security rules that check ownership.
              await setDoc(businessRef, {
                name: user.displayName || user.email,
                adminEmail: user.email,
                status: "Active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
        } catch (error) {
            console.error("Error ensuring business document exists:", error);
        } finally {
            setIsReady(true);
        }
      } else if (!firestore) {
        // If firestore is not ready yet, just wait for the next effect run.
        return;
      }
    };

    ensureBusinessDocExists();

  }, [isUserLoading, user, firestore, router]);


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
