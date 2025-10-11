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
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminNav } from "@/components/admin-nav";

const businesses = [
    { id: '1', name: 'The Cozy Corner Cafe', superAdminId: 'admin1', status: 'Active' },
    { id: '2', name: 'Gourmet Bites', superAdminId: 'admin1', status: 'Active' },
    { id: '3', name: 'Urban Stylez', superAdminId: 'admin1', status: 'Suspended' },
    { id: '4', name: 'Tech Solutions Inc.', superAdminId: 'admin2', status: 'Active' },
];

export default function AdminDashboardPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
           <div className="flex flex-col sm:gap-4 sm:py-4">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <div className="relative ml-auto flex-1 md:grow-0">
                {/* Can add a search bar here if needed */}
              </div>
              <UserNav />
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
                            {businesses.map((business) => (
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
      </SidebarInset>
    </SidebarProvider>
  );
}