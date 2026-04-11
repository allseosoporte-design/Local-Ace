
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { HotmartEventLog } from '@/types/hotmart';

export function HotmartLogTab() {
  const firestore = useFirestore();
  
  const logQuery = useMemo(() => query(
    collection(firestore, 'hotmartEventLogs'),
    orderBy('eventDate', 'desc'),
    limit(50)
  ), [firestore]);

  const { data: logs, isLoading, forceUpdate } = useCollection<HotmartEventLog>(logQuery);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800 border-green-200">Procesado</Badge>;
      case 'failed': return <Badge variant="destructive">Error</Badge>;
      case 'received': return <Badge variant="secondary">Recibido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Webhooks
          </CardTitle>
          <CardDescription>Últimos 50 eventos recibidos desde la API de Hotmart.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => forceUpdate && forceUpdate()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Oferta</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="animate-spin mx-auto h-8 w-8 text-muted-foreground" /></TableCell></TableRow>
              ) : logs?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No hay eventos registrados.</TableCell></TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id} className="text-xs">
                    <TableCell>
                      {log.eventDate ? format(log.eventDate.toDate(), 'dd/MM HH:mm', { locale: es }) : '---'}
                    </TableCell>
                    <TableCell className="font-medium">{log.email}</TableCell>
                    <TableCell>
                      <span className="font-mono">{log.event}</span>
                    </TableCell>
                    <TableCell className="font-mono opacity-70">{log.offerId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(log.status)}
                        {log.errorMessage && (
                          <span className="text-[10px] text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {log.errorMessage}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
