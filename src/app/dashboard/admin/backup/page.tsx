
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
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
  Save,
  Archive,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type Backup = {
    id: string;
    date: string;
    type: 'Completo' | 'Incremental';
    status: 'Completado' | 'Fallido' | 'En progreso';
    size: string;
};

const mockBackupHistory: Backup[] = [
    { id: '1', date: 'Jul 30, 2024 at 9:00 PM', type: 'Completo', status: 'Completado', size: '1.2 GB' },
    { id: '2', date: 'Jul 29, 2024 at 9:00 PM', type: 'Completo', status: 'Completado', size: '1.1 GB' },
    { id: '3', date: 'Jul 28, 2024 at 9:00 PM', type: 'Incremental', status: 'Fallido', size: 'N/A' },
    { id: '4', date: 'Jul 24, 2024 at 9:00 PM', type: 'Completo', status: 'Completado', size: '980 MB' },
];

export default function BackupPage() {
    const { toast } = useToast();
    const [backups, setBackups] = useState<Backup[]>(mockBackupHistory);
    const [isBackupAlertOpen, setIsBackupAlertOpen] = useState(false);
    const [isRestoreAlertOpen, setIsRestoreAlertOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

    const handleInitiateBackup = () => {
        setIsBackupAlertOpen(false);
        toast({
            title: 'Respaldo iniciado',
            description: 'El respaldo completo del sistema ha comenzado. Esto puede tardar varios minutos.',
        });
        const newBackup: Backup = {
            id: (backups.length + 1).toString(),
            date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).replace(',', ' at'),
            type: 'Completo',
            status: 'En progreso',
            size: '...'
        };
        
        // Simulating backup process
        setTimeout(() => {
            setBackups(prev => prev.map(b => b.id === newBackup.id ? {...b, status: 'Completado', size: '1.3 GB'} : b));
             toast({
                title: 'Respaldo completado',
                description: 'El respaldo del sistema se ha completado con éxito.',
            });
        }, 5000);
        
        setBackups([newBackup, ...backups]);
    };

    const handleRestoreBackup = () => {
        setIsRestoreAlertOpen(false);
        if(!selectedBackup) return;
        toast({
            title: 'Restauración iniciada',
            description: `Se está restaurando el sistema desde el respaldo del ${selectedBackup.date}.`,
        });
    }

    const handleDeleteBackup = () => {
        setIsDeleteAlertOpen(false);
        if(!selectedBackup) return;
        setBackups(backups.filter(b => b.id !== selectedBackup.id));
        toast({
            title: 'Respaldo eliminado',
            description: `El respaldo del ${selectedBackup.date} ha sido eliminado.`,
        });
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
                    <Select onValueChange={(value) => setSelectedBackup(backups.find(b => b.id === value) || null)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un respaldo..." />
                        </SelectTrigger>
                        <SelectContent>
                             {backups.filter(b => b.status === 'Completado').map(b => (
                                <SelectItem key={b.id} value={b.id}>{`Respaldo del ${b.date} - ${b.size}`}</SelectItem>
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
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={backup.type === 'Completo' ? 'border-orange-500 text-orange-500' : 'border-blue-500 text-blue-500'}>
                      {backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                        backup.status === 'Completado' ? 'bg-green-100 text-green-800' : 
                        backup.status === 'Fallido' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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

      <Card className='bg-[#FFF9F6]'>
        <CardHeader>
          <CardTitle>Almacenamiento</CardTitle>
          <CardDescription>Descripción del almacenamiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <p className='text-sm'><span className='font-semibold'>Ubicación:</span> /var/backups/websapmax (Servidor local)</p>
            <p className='text-sm'><span className='font-semibold'>Capacidad:</span> 500 GB</p>
            <p className='text-sm'><span className='font-semibold'>Espacio utilizado:</span> 150 GB (30%)</p>
            <Progress value={30} className="mt-4" />
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
                        Esta acción restaurará la base de datos al estado del <span className='font-bold'>{selectedBackup?.date}</span>. Todos los cambios realizados después de esta fecha se perderán.
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
                        Esta acción es irreversible. El archivo de respaldo del <span className='font-bold'>{selectedBackup?.date}</span> será eliminado permanentemente.
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

