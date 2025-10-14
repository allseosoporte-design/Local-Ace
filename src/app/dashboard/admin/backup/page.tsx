
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PlayCircle,
  RotateCcw,
  Settings2,
  MoreHorizontal,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { getIdTokenResult } from 'firebase/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Backup = {
    id: string;
    date: Timestamp;
    type: 'Completo' | 'Incremental';
    status: 'Completado' | 'Fallido' | 'En progreso';
    size: string;
    url?: string;
};

export default function BackupPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isBackupAlertOpen, setIsBackupAlertOpen] = useState(false);
    const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                try {
                    const tokenResult = await getIdTokenResult(user, true);
                    setIsSuperAdmin(tokenResult.claims.isSuperAdmin === true);
                } catch (error) {
                    console.error("Error fetching token claims:", error);
                    setIsSuperAdmin(false);
                }
            }
        };
        checkAdmin();
    }, [user]);

    const backupsQuery = useMemoFirebase(() => {
        if (!firestore || !isSuperAdmin) return null;
        return query(collection(firestore, 'backups'), orderBy('date', 'desc'));
    }, [firestore, isSuperAdmin]);

    const { data: backups, isLoading } = useCollection<Backup>(backupsQuery);

    const handleInitiateBackup = async () => {
        if (!firestore) return;
        setIsBackupAlertOpen(false);
        
        toast({
            title: 'Respaldo iniciado',
            description: 'El respaldo completo del sistema ha comenzado. Esto puede tardar varios minutos.',
        });
        
        try {
            const newBackupRef = await addDoc(collection(firestore, 'backups'), {
                date: serverTimestamp(),
                type: 'Completo',
                status: 'En progreso',
                size: 'Calculando...'
            });

            // Simulate backup process
            setTimeout(async () => {
                try {
                    await updateDoc(newBackupRef, {
                        status: 'Completado',
                        size: '1.3 GB'
                    });
                     toast({
                        title: 'Respaldo completado',
                        description: 'El respaldo del sistema se ha completado con éxito.',
                    });
                } catch (updateError) {
                    await updateDoc(newBackupRef, { status: 'Fallido' });
                    toast({
                        variant: "destructive",
                        title: 'Error en el respaldo',
                        description: 'No se pudo completar el proceso de respaldo.',
                    });
                }
            }, 5000);
        } catch (error) {
             toast({
                variant: "destructive",
                title: 'Error',
                description: 'No se pudo iniciar el respaldo.',
            });
        }
    };

    const handleRestoreBackup = () => {
        setIsRestoreAlertOpen(false);
        if(!selectedBackup) return;
        toast({
            title: 'Restauración iniciada',
            description: `Se está restaurando el sistema desde el respaldo del ${format(selectedBackup.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}.`,
        });
    }

    const handleDeleteBackup = async () => {
        if (!selectedBackup || !firestore) return;
        setIsDeleteAlertOpen(false);
        
        try {
            await deleteDoc(doc(firestore, 'backups', selectedBackup.id));
            toast({
                title: 'Respaldo eliminado',
                description: `El respaldo del ${format(selectedBackup.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })} ha sido eliminado.`,
            });
            setSelectedBackup(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo eliminar el respaldo.',
            });
        }
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl" style={{color: '#FF8550'}}>Respaldo de superadmin</h1>
        <p className="text-muted-foreground">Descripción del componente</p>
      </div>

      <Card className='bg-[#FFF9F6]'>
        <CardHeader>
          <CardTitle>Operaciones</CardTitle>
          <CardDescription>Descripción de las operaciones</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => setIsBackupAlertOpen(true)} className="w-full justify-start text-left" style={{backgroundColor: '#FF8550', color: 'white'}}>
            <PlayCircle className="mr-2 h-5 w-5" />
            Iniciar Respaldo
          </Button>

          <Dialog>
            <DialogTrigger asChild>
                 <Button variant="outline" className="w-full justify-start text-left">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Restaurar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Restaurar desde un respaldo</DialogTitle>
                    <DialogDescription>Selecciona un punto de restauración. Esta acción es irreversible y sobrescribirá los datos actuales.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={(value) => setSelectedBackup(backups?.find(b => b.id === value) || null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un respaldo..." />
                        </SelectTrigger>
                        <SelectContent>
                             {backups?.filter(b => b.status === 'Completado').map(b => (
                                <SelectItem key={b.id} value={b.id}>{`Respaldo del ${b.date ? format(b.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'} - ${b.size}`}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost">Cancelar</Button>
                    <Button onClick={() => { if(selectedBackup) setIsRestoreAlertOpen(true); else toast({variant: "destructive", title: "Selecciona un respaldo"})}}>Restaurar</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
             <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                    <Settings2 className="mr-2 h-5 w-5" />
                    Configuración
                </Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Configuración de Respaldos</DialogTitle>
                     <DialogDescription>Opciones para la programación de respaldos automáticos y políticas de retención.</DialogDescription>
                </DialogHeader>
                <div className="py-4 text-center text-muted-foreground">
                    <p>Esta funcionalidad estará disponible en futuras versiones.</p>
                </div>
            </DialogContent>
          </Dialog>
          
        </CardContent>
      </Card>

      <Card className='bg-[#FFF9F6]'>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Descripción del historial</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                </TableRow>
              )}
               {!isLoading && backups?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No hay respaldos registrados.
                    </TableCell>
                </TableRow>
              )}
              {!isLoading && backups?.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.date ? format(backup.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: es }) : '...'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={backup.type === 'Completo' ? 'border-orange-500 text-orange-500' : 'border-blue-500 text-blue-500'}>
                      {backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                        backup.status === 'Completado' ? 'bg-green-100 text-green-800' : 
                        backup.status === 'Fallido' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800 animate-pulse'
                    }>
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        {backup.status === 'Completado' && <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Descargar respaldo</DropdownMenuItem>}
                        {backup.status === 'Completado' && <DropdownMenuItem onClick={() => {setSelectedBackup(backup); setIsRestoreAlertOpen(true)}}><RotateCcw className="mr-2 h-4 w-4"/>Restaurar respaldo</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => {setSelectedBackup(backup); setIsDeleteAlertOpen(true)}}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar respaldo
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

      <Card className="bg-[#FFF9F6]">
        <CardHeader>
          <CardTitle>Almacenamiento</CardTitle>
          <CardDescription>Información sobre el uso de la base de datos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className='text-sm'><span className='font-semibold'>Ubicación:</span> Cloud Firestore (Servicios de Google Cloud)</p>
            <p className='text-sm'><span className='font-semibold'>Capacidad:</span> Escalable</p>
            <p className='text-sm text-muted-foreground'>El uso del espacio se gestiona y monitoriza a través de la consola de Google Cloud.</p>
        </CardContent>
      </Card>

        {/* AlertDialogs for confirmations */}
        <AlertDialog open={isBackupAlertOpen} onOpenChange={setIsBackupAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Iniciar un nuevo respaldo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción creará un respaldo completo del sistema. Puede afectar el rendimiento temporalmente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleInitiateBackup}>Iniciar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
         <AlertDialog open={isRestoreAlertOpen} onOpenChange={setIsRestoreAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción restaurará la base de datos al estado del <span className='font-bold'>{selectedBackup?.date ? format(selectedBackup.date.toDate(), 'dd/MM/yyyy HH:mm') : ''}</span>. Todos los cambios realizados después de esta fecha se perderán.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRestoreBackup}>Entiendo, restaurar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este respaldo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible. El archivo de respaldo del <span className='font-bold'>{selectedBackup?.date ? format(selectedBackup.date.toDate(), 'dd/MM/yyyy HH:mm') : ''}</span> será eliminado permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBackup} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
