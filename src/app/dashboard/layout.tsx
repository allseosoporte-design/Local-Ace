
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
import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

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

    // CRITICAL: Ensure all necessary user and business documents exist.
    const ensureDocsExist = async () => {
      if (!user || !firestore) {
        setIsReady(true);
        return;
      }
      
      try {
        const batch = writeBatch(firestore);
        
        const userProfileRef = doc(firestore, 'users', user.uid);
        const userProfileDoc = await getDoc(userProfileRef);
        
        // This is a super admin
        if (user.email === 'allseosoporte@gmail.com') {
          if (!userProfileDoc.exists()) {
            batch.set(userProfileRef, { businessId: 'allseosoporte', email: user.email });
          }
        } else {
          // This is a standard business user
          if (!userProfileDoc.exists()) {
            batch.set(userProfileRef, { businessId: user.uid, email: user.email });
          }
          
          const businessRef = doc(firestore, "businesses", user.uid);
          const businessDoc = await getDoc(businessRef);
          if (!businessDoc.exists()) {
            batch.set(businessRef, {
              name: user.displayName || user.email,
              adminEmail: user.email,
              status: "Active",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
        
        await batch.commit();

      } catch (error) {
        console.error("Error ensuring documents exist:", error);
      } finally {
        setIsReady(true);
      }
    };

    ensureDocsExist();

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
