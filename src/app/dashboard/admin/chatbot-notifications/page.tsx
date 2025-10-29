
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Eye, Check, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Conversation {
  id: string;
  userEmail: string;
  lastMessage: string;
  startedAt: Date;
  resolved: boolean;
}

const mockConversations: Conversation[] = [
  { id: 'conv1', userEmail: 'cliente1@example.com', lastMessage: 'No encuentro la sección de facturación.', startedAt: new Date(Date.now() - 1000 * 60 * 5), resolved: false },
  { id: 'conv2', userEmail: 'visitante@test.com', lastMessage: '¿Tienen soporte para integraciones con Shopify?', startedAt: new Date(Date.now() - 1000 * 60 * 22), resolved: false },
  { id: 'conv3', userEmail: 'dudas@proveedor.com', lastMessage: 'Mi plan no se ha actualizado después del pago.', startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), resolved: false },
];

export default function ChatbotNotificationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula la carga de datos
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = useMemo(() => {
    return conversations.filter(c => !c.resolved).length;
  }, [conversations]);

  const handleResolve = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Conversación resuelta',
      description: 'La notificación ha sido marcada como resuelta y archivada.',
    });
  };

  const handleViewConversation = (conversationId: string) => {
    router.push(`/dashboard/admin/chatbot-analytics#${conversationId}`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // En un caso real, aquí se volvería a hacer la llamada a la BD
    setTimeout(() => setIsLoading(false), 500);
     toast({
      title: 'Lista actualizada',
      description: 'Se han recargado las notificaciones.',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Notificaciones del Chatbot
          </h1>
          <p className="text-muted-foreground">
            Revisa las interacciones importantes y alertas de tu chatbot.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
            <Label htmlFor="notifications-switch" className="text-sm font-medium">
                {notificationsEnabled ? 'Notificaciones activas' : 'Notificaciones pausadas'}
            </Label>
            <Switch
                id="notifications-switch"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
            />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones Sin Resolver</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : unreadCount}</div>
            <p className="text-xs text-muted-foreground">
                {unreadCount === 1 ? 'conversación requiere atención' : 'conversaciones requieren atención'}
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                 <div>
                    <CardTitle className="flex items-center gap-2">
                        Historial de Notificaciones
                        {unreadCount > 0 && <Badge>{unreadCount} nuevas</Badge>}
                    </CardTitle>
                    <CardDescription>Últimas conversaciones no resueltas que necesitan revisión.</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                 </Button>
            </div>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-96">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Último Mensaje</TableHead>
                            <TableHead>Hace</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : conversations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                    ¡Todo en orden! No hay notificaciones pendientes.
                                </TableCell>
                            </TableRow>
                        ) : (
                            conversations.map((conv) => (
                                <TableRow key={conv.id}>
                                    <TableCell className="font-medium">{conv.userEmail}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-sm">{conv.lastMessage}</TableCell>
                                    <TableCell>{formatDistanceToNow(conv.startedAt, { addSuffix: true, locale: es })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleViewConversation(conv.id)}>
                                            <Eye className="h-4 w-4 mr-1" /> Ver
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleResolve(conv.id)}>
                                            <Check className="h-4 w-4 mr-1" /> Resolver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                 </Table>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
