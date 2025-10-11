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
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <LocalLeap className="h-6 w-6" />
            <span className="sr-only">Local Leap</span>
          </Link>
          <DashboardNav />
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
             {/* Search can go here if needed */}
          </div>
          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
