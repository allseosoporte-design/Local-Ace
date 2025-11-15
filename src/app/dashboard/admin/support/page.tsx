
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, MessageSquare, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getIdTokenResult } from 'firebase/auth';

interface SupportTicket {
  id: string;
  companyName: string;
  planName: string;
  subject: string;
  createdAt: Timestamp;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  source: 'public' | 'internal';
}

const priorityMap = {
  low: { label: 'Baja', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-red-100 text-red-800' },
};

const statusMap = {
  open: { label: 'Abierto', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800' },
};


export default function AdminSupportPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'internal' | 'public'>('internal');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
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

  const ticketsQuery = useMemo(() => {
    if (isCheckingAdmin || !isSuperAdmin || !firestore) return null;
    
    let q = collection(firestore, 'supportTickets');
    
    const constraints = [
        where('source', '==', activeTab),
        orderBy('createdAt', 'desc')
    ];

    if (statusFilter !== 'all') {
        constraints.push(where('status', '==', statusFilter));
    }
    if (priorityFilter !== 'all') {
        constraints.push(where('priority', '==', priorityFilter));
    }

    return query(q, ...constraints);

  }, [firestore, activeTab, statusFilter, priorityFilter, isCheckingAdmin, isSuperAdmin]);

  const { data: tickets, isLoading: isLoadingTickets } = useCollection<SupportTicket>(ticketsQuery);

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    if (!searchTerm) return tickets;
    return tickets.filter(
      (ticket) =>
        ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tickets, searchTerm]);

  const isLoading = isUserLoading || isCheckingAdmin || (ticketsQuery !== null && isLoadingTickets);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
          <MessageSquare className='h-8 w-8'/> Soporte
        </h1>
        <p className="text-muted-foreground">
          Administra las solicitudes de los clientes y visitantes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bandeja de Entrada</CardTitle>
          <CardDescription>Visualiza y gestiona todos los tickets de soporte y mensajes de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'internal' | 'public')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="internal">Tickets de Soporte (Internos)</TabsTrigger>
                    <TabsTrigger value="public">Mensajes de Contacto (Públicos)</TabsTrigger>
                </TabsList>
                 <div className="flex items-center gap-4 py-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por empresa, asunto, email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                          {statusFilter === 'all' ? 'Todos los Estados' : statusMap[statusFilter as keyof typeof statusMap].label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                            <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="open">Abierto</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="in_progress">En Progreso</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="closed">Cerrado</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                           {priorityFilter === 'all' ? 'Todas las Prioridades' : priorityMap[priorityFilter as keyof typeof priorityMap].label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por prioridad</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                            <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="low">Baja</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="medium">Media</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="high">Alta</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <TabsContent value={activeTab}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Remitente / Plan</TableHead>
                        <TableHead>Asunto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading && (!isSuperAdmin || filteredTickets.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            No hay tickets que coincidan con los filtros.
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading && isSuperAdmin &&
                        filteredTickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              <div className="font-medium">{ticket.companyName}</div>
                              <div className="text-sm text-muted-foreground">{ticket.planName}</div>
                            </TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>
                              {ticket.createdAt
                                ? format(ticket.createdAt.toDate(), 'dd/MM/yyyy, HH:mm', { locale: es })
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${priorityMap[ticket.priority].color} hover:${priorityMap[ticket.priority].color}`}>
                                {priorityMap[ticket.priority].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusMap[ticket.status].color} hover:${statusMap[ticket.status].color}`}>
                                {statusMap[ticket.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
