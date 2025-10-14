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
import { getIdTokenResult } from 'firebase/auth';
import { Loader2, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    
    if (!user) {
      router.replace('/login');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const tokenResult = await getIdTokenResult(user, true); // Force refresh
        
        if (tokenResult.claims.isSuperAdmin === true) {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error("Error verificando super admin:", error);
        setIsSuperAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [user, isUserLoading, router]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado al portapapeles",
      description: "El comando está listo para ser pegado en la terminal.",
    });
  };

  const claimCommand = `firebase functions:shell --project ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tu-project-id'} --region us-central1
// Una vez dentro del shell, ejecuta:
addSuperAdminRole({email: "${user?.email}"})`;


  if (isSuperAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className='flex items-center gap-2'>
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className='text-muted-foreground'>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (isSuperAdmin === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-blue-50">
        <Card className="text-center w-full max-w-2xl shadow-lg border-yellow-500 border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600 flex items-center justify-center gap-2">
              <Terminal className="h-7 w-7" />
              Diagnóstico de Permisos
            </CardTitle>
            <CardDescription className="pt-2">
              El usuario <span className="font-bold text-primary">{user?.email}</span> ha sido autenticado, pero no tiene el rol de Super Administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className='text-sm text-muted-foreground'>
              Para resolver esto, el `custom claim` <code className="bg-muted px-1 py-0.5 rounded-sm font-mono text-xs">isSuperAdmin: true</code> debe ser asignado a tu usuario en Firebase.
            </p>
            <div className="bg-gray-900 text-left text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
              <p className="text-gray-400">// Paso 1: Ejecuta este comando en tu terminal local (con Firebase CLI instalado)</p>
              <pre className="mt-2 whitespace-pre-wrap">{`firebase functions:shell`}</pre>
              <p className="text-gray-400 mt-4">// Paso 2: Una vez dentro del shell de functions, pega y ejecuta esto:</p>
              <pre className="mt-2 whitespace-pre-wrap">{`addSuperAdminRole({email: "${user?.email}"})`}</pre>
            </div>
             <Button onClick={() => handleCopyToClipboard(`addSuperAdminRole({email: "${user?.email}"})`)}>Copiar Comando Interno</Button>
            <p className="text-xs text-muted-foreground pt-4">
              Después de ejecutar el comando, **cierra sesión y vuelve a iniciar sesión** para que los cambios tomen efecto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
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
