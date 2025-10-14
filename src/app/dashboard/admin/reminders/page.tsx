'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Pencil,
  Trash2,
  PlusCircle,
  Settings,
  Mail,
  History,
  Server,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

// --- Types ---
interface ReminderRule {
  id: string;
  name: string;
  triggerType: 'before' | 'after';
  days: number;
  channel: 'email' | 'whatsapp' | 'sms';
  templateId: string;
  isActive: boolean;
}

interface ReminderTemplate {
  id: string;
  name: string;
  content: string;
  channel: 'email' | 'whatsapp' | 'sms';
}

interface ReminderLog {
  id: string;
  businessName: string;
  ruleName: string; // Denormalized for easy display
  sentAt: Timestamp;
  status: 'sent' | 'opened' | 'failed';
}

const configurations: ReminderRule[] = [
    { id: '1', name: 'Aviso 7 días antes', triggerType: 'before', days: 7, channel: 'email', templateId: 'template-1', isActive: true },
    { id: '2', name: 'Primer aviso vencido', triggerType: 'after', days: 1, channel: 'email', templateId: 'template-2', isActive: true },
    { id: '3', name: 'Último aviso', triggerType: 'after', days: 5, channel: 'whatsapp', templateId: 'template-3', isActive: false },
];

const templates: ReminderTemplate[] = [
    { id: 'template-1', name: 'Recordatorio de vencimiento próximo', content: 'Hola {empresa}, tu suscripción al plan {plan} está a punto de vencer. Renueva ahora para no perder acceso.', channel: 'email' },
    { id: 'template-2', name: 'Aviso de pago vencido', content: 'Hola {empresa}, hemos notado que tu pago para el plan {plan} está vencido. Por favor, regulariza tu situación para evitar la suspensión del servicio.', channel: 'email' },
    { id: 'template-3', name: 'Aviso urgente de pago', content: 'URGENTE: {empresa}, tu servicio será suspendido. Contacta con soporte.', channel: 'whatsapp' },
];

const history: ReminderLog[] = [
    { id: '1', businessName: 'Café El Sol', ruleName: 'Aviso 7 días antes', sentAt: Timestamp.fromDate(new Date('2024-07-20T10:00:00')), status: 'sent' },
    { id: '2', businessName: 'Burger Hub', ruleName: 'Aviso de pago vencido', sentAt: Timestamp.fromDate(new Date('2024-07-19T14:30:00')), status: 'opened' },
    { id: '3', businessName: 'Pizzería La Nostra', ruleName: 'Aviso 7 días antes', sentAt: Timestamp.fromDate(new Date('2024-07-18T09:00:00')), status: 'failed' },
];


export default function RemindersPage() {
  const firestore = useFirestore();

  const rulesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reminderRules'), orderBy('name'));
  }, [firestore]);

  const templatesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reminderTemplates'), orderBy('name'));
  }, [firestore]);

  const logsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reminderLogs'), orderBy('sentAt', 'desc'));
  }, [firestore]);


  const { data: rulesData, isLoading: isLoadingRules } = useCollection<ReminderRule>(rulesQuery);
  const { data: templatesData, isLoading: isLoadingTemplates } = useCollection<ReminderTemplate>(templatesQuery);
  const { data: logsData, isLoading: isLoadingLogs } = useCollection<ReminderLog>(logsQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Recordatorios</h1>
          <p className="text-muted-foreground">
            Gestión de recordatorios de pago de suscripciones.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="resumen">
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resumen">
                <Calendar className="mr-2 h-4 w-4" /> Resumen
            </TabsTrigger>
            <TabsTrigger value="configuracion">
                <Settings className="mr-2 h-4 w-4" /> Configuración
            </TabsTrigger>
            <TabsTrigger value="plantillas">
                <Mail className="mr-2 h-4 w-4" /> Plantillas
            </TabsTrigger>
            <TabsTrigger value="historial">
                <History className="mr-2 h-4 w-4" /> Historial
            </TabsTrigger>
            <TabsTrigger value="sistema">
                <Server className="mr-2 h-4 w-4" /> Sistema
            </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Próximos a vencer</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">5</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Enviados hoy</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">47</div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Próximos recordatorios</CardTitle>
                    <CardDescription>Visualización de los próximos envíos automáticos programados.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
                    <Calendar className="h-12 w-12 mb-4" />
                    <p>No hay recordatorios próximos</p>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="configuracion">
           <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Reglas de Envío</CardTitle>
                    <CardDescription>Gestiona cuándo se envían los recordatorios automáticos.</CardDescription>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Nueva Configuración
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Configuración de Recordatorio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="config-name">Nombre</Label>
                                <Input id="config-name" placeholder="Ej: Primer aviso" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="config-trigger">Tipo de Disparo</Label>
                                <Select>
                                    <SelectTrigger id="config-trigger"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="before">Antes de la expiración</SelectItem>
                                        <SelectItem value="after">Después de la expiración</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="config-days">Días</Label>
                                <Input id="config-days" type="number" placeholder="7" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="config-method">Método de Envío</Label>
                                <Select>
                                    <SelectTrigger id="config-method"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Correo electrónico</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="config-status" />
                                <Label htmlFor="config-status">Activo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost">Cancelar</Button>
                            <Button>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingRules && (
                           <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /></TableCell></TableRow>
                        )}
                        {!isLoadingRules && (rulesData || configurations).map((config) => (
                            <TableRow key={config.id}>
                                <TableCell className="font-medium">{config.name}</TableCell>
                                <TableCell>{`${config.days} días ${config.triggerType === 'before' ? 'antes' : 'después'} de la expiración`}</TableCell>
                                <TableCell>
                                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                                        {config.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="plantillas">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Plantillas de Mensajes</CardTitle>
                    <CardDescription>Edita el contenido de los mensajes de recordatorio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {isLoadingTemplates && <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-muted-foreground" />}
                    {!isLoadingTemplates && (templatesData || templates).map((template) => (
                        <div key={template.id} className="border p-4 rounded-lg flex justify-between items-center">
                           <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{`Canal: ${template.channel}`}</p>
                           </div>
                            <Dialog>
                               <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                               </DialogTrigger>
                               <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Editar Plantilla: {template.name}</DialogTitle>
                                    </DialogHeader>
                                    <Textarea defaultValue={template.content} className="min-h-[200px] mt-4" />
                                    <DialogFooter className="mt-4">
                                        <Button variant="ghost">Cancelar</Button>
                                        <Button>Guardar Cambios</Button>
                                    </DialogFooter>
                               </DialogContent>
                            </Dialog>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="historial">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Historial de Envíos</CardTitle>
                    <CardDescription>Registro de todos los recordatorios enviados.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Tipo de Recordatorio</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingLogs && (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /></TableCell></TableRow>
                        )}
                        {!isLoadingLogs && (logsData || history).map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.businessName}</TableCell>
                                <TableCell>{item.ruleName}</TableCell>
                                <TableCell>{format(item.sentAt.toDate(), 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        item.status === 'sent' ? 'default' :
                                        item.status === 'opened' ? 'outline' : 'destructive'
                                    }>{item.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="sistema">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Estado del Sistema de Recordatorios</CardTitle>
                    <CardDescription>Información y acciones sobre el servicio de envío.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                            <p className="font-semibold">Estado del servicio</p>
                            <p className="text-sm text-green-600 font-bold flex items-center gap-2"><CheckCircle className="h-4 w-4"/>En ejecución</p>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="outline">Pausar</Button>
                           <Button>Ejecutar ahora</Button>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="font-semibold">Última ejecución:</span> 2024-07-21 10:00:05</p>
                        <p><span className="font-semibold">Próxima ejecución:</span> 2024-07-21 11:00:00</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
