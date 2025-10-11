'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserNav } from "@/components/user-nav";
import { AdminNav } from "@/components/admin-nav";
import Link from 'next/link';
import { LocalLeap } from '@/components/icons';
import { useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  
  const businessesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "businesses"));
  }, [firestore]);

  const { data: businesses, isLoading } = useCollection(businessesQuery);

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full flex-col">
       <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <Link
                href="/dashboard/admin"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
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
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
           <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
              <CardHeader>
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle>Gestión de Clientes</CardTitle>
                      <CardDescription>
                          Crea, modifica y gestiona las cuentas de tus clientes.
                      </CardDescription>
                  </div>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear Negocio
                  </Button>
              </div>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                      <TableRow>
                          <TableHead>Nombre del Negocio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Administrador</TableHead>
                          <TableHead>
                          <span className="sr-only">Acciones</span>
                          </TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Cargando negocios...</TableCell></TableRow>}
                      {!isLoading && businesses?.map((business) => (
                          <TableRow key={business.id}>
                              <TableCell className="font-medium">{business.name}</TableCell>
                              <TableCell>
                              <Badge variant={business.status === 'Active' ? 'default' : 'destructive'}>
                                  {business.status === 'Active' ? 'Activo' : 'Suspendido'}
                              </Badge>
                              </TableCell>
                              <TableCell>{business.superAdminId}</TableCell>
                              <TableCell>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                      <Button aria-haspopup="true" size="icon" variant="ghost">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Menú de acciones</span>
                                      </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                      <DropdownMenuItem>Editar</DropdownMenuItem>
                                      <DropdownMenuItem>Suspender</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </TableRow>
                      ))}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}
