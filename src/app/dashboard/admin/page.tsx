
'use client';

import { useState, useMemo, useEffect } from "react";
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { BusinessModal, BusinessFormData } from "@/components/business-modal";
import { useToast } from "@/hooks/use-toast";
import { getIdTokenResult } from "firebase/auth";

type Business = {
  id: string;
  name: string;
  adminEmail: string;
  status: "Active" | "Suspended";
  superAdminId?: string;
};

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          // Forzar la actualización del token para obtener los claims más recientes
          const tokenResult = await getIdTokenResult(user, true);
          const claims = tokenResult.claims;
          if (claims.isSuperAdmin === true) {
            setIsSuperAdmin(true);
          }
        } catch (error) {
          console.error("Error fetching token claims:", error);
          setIsSuperAdmin(false);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else if (!isUserLoading) {
        setIsCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, [user, isUserLoading]);

  const businessesQuery = useMemoFirebase(() => {
    // Retrasar la consulta hasta que se confirme que el usuario es superadmin
    if (isCheckingAdmin || !isSuperAdmin || !firestore) return null;
    return query(collection(firestore, "businesses"));
  }, [firestore, isSuperAdmin, isCheckingAdmin]);

  const { data: businesses, isLoading: isLoadingBusinesses } = useCollection<Business>(businessesQuery);

  const handleCreate = () => {
    setEditingBusiness(null);
    setIsModalOpen(true);
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setIsModalOpen(true);
  };

  const handleDeleteConfirmation = (business: Business) => {
    setBusinessToDelete(business);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!businessToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, "businesses", businessToDelete.id));
      toast({ title: "Negocio eliminado", description: "El negocio ha sido eliminado exitosamente." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el negocio." });
    } finally {
      setIsAlertOpen(false);
      setBusinessToDelete(null);
    }
  };

  const handleSave = async (data: BusinessFormData) => {
    if (!firestore) return;
    try {
      if (editingBusiness) {
        // Update
        const businessRef = doc(firestore, "businesses", editingBusiness.id);
        await updateDoc(businessRef, { ...data, updatedAt: serverTimestamp() });
        toast({ title: "Negocio actualizado", description: "Los cambios han sido guardados." });
      } else {
        // Create
        await addDoc(collection(firestore, "businesses"), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Negocio creado", description: "El nuevo negocio ha sido añadido." });
      }
      setIsModalOpen(false);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el negocio." });
    }
  };
  
  const showLoading = isUserLoading || isCheckingAdmin || (businessesQuery !== null && isLoadingBusinesses);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>Crea, modifica y gestiona las cuentas de tus clientes.</CardDescription>
            </div>
            <Button onClick={handleCreate} disabled={!isSuperAdmin}>
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
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading && <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>}
              {!showLoading && (!isSuperAdmin || businesses?.length === 0) && <TableRow><TableCell colSpan={4} className="text-center">No hay negocios registrados o no tienes permisos.</TableCell></TableRow>}
              {!showLoading && isSuperAdmin && businesses?.map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">{business.name}</TableCell>
                  <TableCell>
                    <Badge variant={business.status === 'Active' ? 'default' : 'destructive'}>
                      {business.status === 'Active' ? 'Activo' : 'Suspendido'}
                    </Badge>
                  </TableCell>
                  <TableCell>{business.adminEmail}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú de acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(business)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteConfirmation(business)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <BusinessModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        business={editingBusiness}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el negocio de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
