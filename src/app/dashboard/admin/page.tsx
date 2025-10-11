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
import { useMemo } from "react";
import { useCollection } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  
  const businessesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "businesses"));
  }, [firestore]);

  const { data: businesses, isLoading } = useCollection(businessesQuery);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <LocalLeap className="h-6 w-6" />
            <span className="sr-only">Local Leap</span>
          </Link>
          <AdminNav />
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
             {/* Search can go here if needed */}
          </div>
          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
  );
}
