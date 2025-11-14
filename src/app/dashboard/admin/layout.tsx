
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    
    if (!user) {
      router.replace('/login');
      return;
    }

    // Estrategia de "Modo Dios" Temporal:
    // Si el email es el del super admin, conceder acceso directamente.
    // Esto evita depender de custom claims que no podemos asignar.
    if (user.email === 'allseosoporte@gmail.com') {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
  }, [user, isUserLoading, router]);

  if (hasAccess === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className='flex items-center gap-2'>
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className='text-muted-foreground'>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-muted/40">
        <Card className="text-center w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>No tienes permiso para acceder a esta sección.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Esta área es exclusiva para superadministradores. Si crees que esto es un error, por favor contacta al soporte técnico.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr]">
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
