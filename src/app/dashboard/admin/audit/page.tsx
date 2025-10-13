
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Eye } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getIdTokenResult } from 'firebase/auth';

interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered';
  performedBy: {
    uid: string;
    email: string;
  };
  timestamp: Timestamp;
  previousData?: any;
  newData?: any;
  details?: string;
}

const actionMap = {
  created: { label: 'Creado', color: 'bg-green-100 text-green-800' },
  updated: { label: 'Actualizado', color: 'bg-blue-100 text-blue-800' },
  deleted: { label: 'Eliminado', color: 'bg-red-100 text-red-800' },
  reordered: { label: 'Reordenado', color: 'bg-yellow-100 text-yellow-800' },
};

const entityMap: { [key: string]: string } = {
  'subscriptionPlans': 'Planes',
  'companies': 'Empresas',
  'users': 'Usuarios',
};


export default function AuditPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user, true);
          if (tokenResult.claims.isSuperAdmin) {
            setIsSuperAdmin(true);
          }
        } catch (error) {
          console.error("Error verifying super admin status:", error);
          setIsSuperAdmin(false);
        }
      }
    };
    checkAdminStatus();
  }, [user]);

  const auditQuery = useMemoFirebase(() => {
    if (!firestore || !isSuperAdmin) return null;
    let q = query(collection(firestore, 'globalAuditLogs'), orderBy('timestamp', 'desc'));
    
    const constraints = [];
    if (entityFilter !== 'all') {
      constraints.push(where('entity', '==', entityFilter));
    }
    if (actionFilter !== 'all') {
      constraints.push(where('action', '==', actionFilter));
    }
    
    if(constraints.length > 0) {
      q = query(collection(firestore, 'globalAuditLogs'), orderBy('timestamp', 'desc'), ...constraints);
    }
    
    return q;
  }, [firestore, isSuperAdmin, entityFilter, actionFilter]);

  const { data: logs, isLoading } = useCollection<AuditLog>(auditQuery);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (!searchTerm) return logs;
    return logs.filter((log) =>
      log.performedBy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Auditoría Global</h1>
        <p className="text-muted-foreground">Historial de acciones críticas en el sistema.</p>
      </div>

      <Card className="bg-[#FFF9F6]">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>Filtra los registros para encontrar lo que necesitas.</CardDescription>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por email, entidad, ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{entityFilter === 'all' ? 'Todas las Entidades' : entityMap[entityFilter] || entityFilter}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por entidad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={entityFilter} onValueChange={setEntityFilter}>
                  <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="subscriptionPlans">Planes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="companies">Empresas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="users">Usuarios</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{actionFilter === 'all' ? 'Todas las Acciones' : actionMap[actionFilter as keyof typeof actionMap]?.label || actionFilter}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por acción</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={actionFilter} onValueChange={setActionFilter}>
                  <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created">Creado</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="updated">Actualizado</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="deleted">Eliminado</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="reordered">Reordenado</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Realizado por</TableHead>
                <TableHead className="text-right">Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No se encontraron registros de auditoría.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.timestamp ? format(log.timestamp.toDate(), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : 'N/A'}
                  </TableCell>
                  <TableCell>{entityMap[log.entity] || log.entity}</TableCell>
                  <TableCell>
                    <Badge className={`${actionMap[log.action]?.color} hover:${actionMap[log.action]?.color}`}>{actionMap[log.action]?.label || log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.performedBy.email}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedLog} onOpenChange={(isOpen) => !isOpen && setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Registro de Auditoría</DialogTitle>
            <DialogDescription>
              Acción <span className="font-bold">{selectedLog?.action}</span> en la entidad <span className="font-bold">{selectedLog ? entityMap[selectedLog.entity] : ''}</span> (ID: {selectedLog?.entityId})
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto">
            <div className='space-y-2'>
              <h3 className="font-semibold text-lg">Datos Anteriores</h3>
              <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                {selectedLog?.previousData ? JSON.stringify(selectedLog.previousData, null, 2) : 'N/A'}
              </pre>
            </div>
            <div className='space-y-2'>
              <h3 className="font-semibold text-lg">Datos Nuevos</h3>
              <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                {selectedLog?.newData ? JSON.stringify(selectedLog.newData, null, 2) : 'N/A'}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    